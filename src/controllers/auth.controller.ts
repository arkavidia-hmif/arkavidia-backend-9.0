import * as argon2 from 'argon2';
import type { Context } from 'hono';
import { deleteCookie, setCookie } from 'hono/cookie';
import * as jwt from 'hono/jwt';
import { JwtTokenInvalid } from 'hono/utils/jwt/types';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import type { UserIdentity } from '~/db/schema/auth.schema';
import type { User } from '~/db/schema/user.schema';
import { sendVerificationEmail } from '~/lib/nodemailer';
import {
	createUserIdentity,
	findUserIdentityByEmail,
	findUserIdentityById,
	updateUserIdentity,
	updateUserVerification,
} from '~/repositories/auth.repository';
import {
	findUserByEmail,
	findUserById,
	updateUser,
} from '~/repositories/user.repository';
import {
	basicLoginRoute,
	basicRegisterRoute,
	basicVerifyAccountRoute,
	googleAuthCallbackRoute,
	googleAuthRoute,
	logoutRoute,
	refreshRoute,
	selfRoute,
} from '~/routes/auth.route';
import { GoogleTokenDataSchema, GoogleUserSchema } from '~/types/auth.type';
import { UserSchema } from '~/types/user.type';
import { createAuthRouter, createRouter } from '../utils/router-factory';

const VERIFICATION_TOKEN_EXPIRATION_TIME = 360000; // TTL 1 hour

export const authRouter = createRouter();
export const authProtectedRouter = createAuthRouter();

const generateAccessToken = async (user: User, userIdentity: UserIdentity) => {
	const payload = {
		...user,
		provider: userIdentity.provider,
		exp: Math.floor(Date.now() / 1000) + env.ACCESS_TOKEN_EXPIRATION,
	};
	const token = await jwt.sign(payload, env.ACCESS_TOKEN_SECRET);
	return token;
};

const generateRefreshToken = async (user: User) => {
	const payload = {
		userId: user.id,
		exp: Math.floor(Date.now() / 1000) + env.REFRESH_TOKEN_EXPIRATION,
	};
	const token = await jwt.sign(payload, env.REFRESH_TOKEN_SECRET);
	return token;
};

const setCookiesToken = async (
	c: Context,
	user: User,
	userIdentity: UserIdentity,
) => {
	const accessToken = await generateAccessToken(user, userIdentity);
	const refreshToken = await generateRefreshToken(user);

	await updateUserIdentity(db, user.id, {
		refreshToken,
	});

	setCookie(c, 'khongguan', accessToken, {
		path: '/',
		secure: true,
		httpOnly: true,
		maxAge: env.ACCESS_TOKEN_EXPIRATION,
		sameSite: 'None',
	});

	setCookie(c, 'saltcheese', refreshToken, {
		path: '/',
		secure: true,
		httpOnly: true,
		maxAge: env.REFRESH_TOKEN_EXPIRATION,
		sameSite: 'None',
	});

	return { accessToken, refreshToken };
};

/** BASIC AUTHENTICATION ROUTES (Email & Password) */
authRouter.openapi(basicRegisterRoute, async (c) => {
	const { email, password } = c.req.valid('json');

	const passwordHash = await argon2.hash(password);
	const verifyTokenExpiration = new Date(
		new Date().getTime() + VERIFICATION_TOKEN_EXPIRATION_TIME,
	);
	const verifyToken = await argon2.hash(
		`${email}${new Date()}${verifyTokenExpiration.toISOString()}`,
	);

	const user = await findUserIdentityByEmail(db, email);
	if (user) {
		if (
			!user.isVerified &&
			new Date() > new Date(user.verificationTokenExpiration)
		) {
			// If email already exists and old token expired, regenerate token
			// TODO: Maybe add penalty if regenerate token? wait 1 min, 2 min, 10 min, 60 min
			await updateUserIdentity(db, user.id, {
				verificationToken: verifyToken,
				verificationTokenExpiration: verifyTokenExpiration,
			});
		} else return c.json({ message: 'User already exist' }, 400);
	}

	const newUser = await createUserIdentity(db, {
		email: email,
		hash: passwordHash,
		provider: 'basic',
		isVerified: false,
		verificationToken: verifyToken,
		verificationTokenExpiration: verifyTokenExpiration,
	});

	await sendVerificationEmail(email, verifyToken, newUser.id);
	return c.json({}, 204);
});

authRouter.openapi(basicVerifyAccountRoute, async (c) => {
	const userIdentity = await findUserIdentityById(
		db,
		c.req.valid('query').user,
	);
	const user = await findUserByEmail(db, userIdentity?.email as string);

	if (!userIdentity || !user)
		return c.json({ message: "User doesn't exists" }, 400);
	if (new Date() > new Date(userIdentity.verificationTokenExpiration))
		return c.json({ message: 'Token has expired' }, 400);
	if (userIdentity.verificationToken !== c.req.valid('query').token)
		return c.json({ message: 'Wrong token' }, 400);

	if (!(await updateUserVerification(db, c.req.valid('query').user)))
		return c.json({ message: 'Something went wrong' }, 500);

	// Login user
	const { accessToken, refreshToken } = await setCookiesToken(
		c,
		user,
		userIdentity,
	);
	return c.json(
		{
			accessToken,
			refreshToken,
		},
		200,
	);
});

authRouter.openapi(basicLoginRoute, async (c) => {
	const { email, password } = c.req.valid('json');

	const userIdentity = await findUserIdentityByEmail(db, email);
	const user = await findUserByEmail(db, email);

	if (!userIdentity || !user)
		return c.json({ message: 'Email not found' }, 400);
	if (!(await argon2.verify(userIdentity.hash, password)))
		return c.json({ message: 'Wrong password' }, 400);
	if (!userIdentity.isVerified)
		return c.json({ message: "User isn't verified" }, 400);

	// Login user
	const { accessToken, refreshToken } = await setCookiesToken(
		c,
		user,
		userIdentity,
	);
	return c.json(
		{
			accessToken,
			refreshToken,
		},
		200,
	);
});

/** GOOGLE AUTHENTICATION ROUTES */
authRouter.openapi(googleAuthRoute, async (c) => {
	const authorizationUrl = new URL(
		'https://accounts.google.com/o/oauth2/v2/auth',
	);

	authorizationUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '');
	authorizationUrl.searchParams.set(
		'redirect_uri',
		env.GOOGLE_CALLBACK_URL || '',
	);
	authorizationUrl.searchParams.set('prompt', 'consent');
	authorizationUrl.searchParams.set('response_type', 'code');
	authorizationUrl.searchParams.set('scope', 'email profile');
	authorizationUrl.searchParams.set('access_type', 'offline');

	// Redirect the user to Google Login
	return c.redirect(authorizationUrl.toString(), 302);
});

authRouter.openapi(googleAuthCallbackRoute, async (c) => {
	const { code } = c.req.valid('query');

	const tokenEndpoint = new URL('https://accounts.google.com/o/oauth2/token');
	tokenEndpoint.searchParams.set('code', code);
	tokenEndpoint.searchParams.set('grant_type', 'authorization_code');

	// Make sure you define all of the google env in your .env file
	tokenEndpoint.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '');
	tokenEndpoint.searchParams.set(
		'client_secret',
		env.GOOGLE_CLIENT_SECRET || '',
	);
	tokenEndpoint.searchParams.set('redirect_uri', env.GOOGLE_CALLBACK_URL || '');

	// Fetch Token from Google Token endpoint and parse it into GoogleTokenDataSchema
	const tokenResponse = await fetch(
		tokenEndpoint.origin + tokenEndpoint.pathname,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: tokenEndpoint.searchParams.toString(),
		},
	);
	const tokenData = GoogleTokenDataSchema.parse(await tokenResponse.json());

	// Fetch User Info from Google User Info endpoint and parse it into GoogleUserSchema
	const userInfoResponse = await fetch(
		'https://www.googleapis.com/oauth2/v2/userinfo',
		{
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`,
			},
		},
	);
	const userInfo = GoogleUserSchema.parse(await userInfoResponse.json());
	const userIdentity = await findUserIdentityByEmail(db, userInfo.email);
	if (!userIdentity) {
		// If user is not registered, then register it
		const googleDataHash = await argon2.hash(JSON.stringify(userInfo));
		const newUser = await createUserIdentity(db, {
			email: userInfo.email,
			hash: googleDataHash,
			provider: 'google',
			isVerified: true,
			verificationToken: 'google',
			verificationTokenExpiration: new Date(),
		});

		await updateUser(db, newUser.id, { fullName: userInfo.name });
	}

	const existingUserIdentity = (await findUserIdentityByEmail(
		db,
		userInfo.email,
	)) as UserIdentity;
	const existingUser = (await findUserByEmail(db, userInfo.email)) as User;

	const { accessToken, refreshToken } = await setCookiesToken(
		c,
		existingUser,
		existingUserIdentity,
	);
	return c.json(
		{
			accessToken,
			refreshToken,
		},
		200,
	);
});

/** BOTH AUTH */
authProtectedRouter.openapi(logoutRoute, async (c) => {
	deleteCookie(c, 'khongguan');
	deleteCookie(c, 'saltcheese');
	await updateUserIdentity(db, c.var.user.id, {
		refreshToken: null,
	});
	return c.json({}, 204);
});

authProtectedRouter.openapi(selfRoute, async (c) => {
	const user = await UserSchema.parseAsync(c.var.user);
	return c.json(user, 200);
});

authRouter.openapi(refreshRoute, async (c) => {
	try {
		const decoded = await jwt.verify(
			c.req.valid('query').token,
			env.REFRESH_TOKEN_SECRET,
		);
		const userIdentity = await findUserIdentityById(
			db,
			decoded.userId as string,
		);
		const user = await findUserById(db, decoded.userId as string);

		if (!userIdentity || !user)
			return c.json({ message: 'User not found' }, 400);
		if (userIdentity.refreshToken !== c.req.valid('query').token)
			return c.json({ message: "Token doesn't match!" }, 400);
		if (!userIdentity.isVerified)
			return c.json({ message: "User isn't verified" }, 400);

		// Login user
		const { accessToken, refreshToken } = await setCookiesToken(
			c,
			user,
			userIdentity,
		);
		return c.json(
			{
				accessToken,
				refreshToken,
			},
			200,
		);
	} catch (e) {
		if (e instanceof JwtTokenInvalid)
			return c.json({ message: 'You need to provide refresh token' }, 400);
		throw e;
	}
});
