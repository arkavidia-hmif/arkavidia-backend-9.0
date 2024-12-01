import * as argon2 from 'argon2';
import { deleteCookie, setCookie } from 'hono/cookie';
import * as jwt from 'hono/jwt';
import { PostgresError } from 'postgres';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import type { User } from '~/db/schema/user.schema';
import { sendVerificationEmail } from '~/lib/nodemailer';
import {
	createUserIdentity,
	findUserByEmail,
	findUserIdentityByEmail,
	getUserIdentity,
	updateUserIdentity,
	updateUserVerification,
} from '~/repositories/auth.repository';
import {
	basicLoginRoute,
	basicRegisterRoute,
	basicVerifyAccountRoute,
	logoutRoute,
} from '~/routes/auth.route';
import { createRouter } from '../utils/router-factory';

const VERIFICATION_TOKEN_EXPIRATION_TIME = 3600; // TTL 1 hour

export const authRouter = createRouter();
// export const authProtectedRouter = createAuthRouter();

const generateAccessToken = async (user: User) => {
	const payload = {
		...user,
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
		)
			// If email already exists and old token expired, regenerate token
			// TODO: Maybe add penalty if regenerate token? wait 1 min, 2 min, 10 min, 60 min
			await updateUserIdentity(db, user.id, {
				verificationToken: verifyToken,
				verificationTokenExpiration: verifyTokenExpiration,
			});
		else return c.json({ message: 'User already exist' }, 400);
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
	const { user, token } = c.req.valid('query');
	const userIdentity = await getUserIdentity(db, user);

	if (!userIdentity) return c.json({ message: "User doesn't exists" }, 400);
	if (new Date() > new Date(userIdentity.verificationTokenExpiration))
		return c.json({ message: 'Token has expired' }, 400);
	if (userIdentity.verificationToken !== token)
		return c.json({ message: 'Wrong token' }, 400);

	if (!(await updateUserVerification(db, user)))
		return c.json({ message: 'Something went wrong' }, 500);
	return c.json({}, 204);
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

	const accessToken = await generateAccessToken(user);
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

	return c.json(
		{
			accessToken,
			refreshToken,
		},
		200,
	);
});

// authRouter.openapi(logoutRoute, async (c) => {
// 	deleteCookie(c, 'khongguan');
// 	await
// })
