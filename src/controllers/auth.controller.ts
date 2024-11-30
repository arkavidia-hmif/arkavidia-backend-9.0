import * as argon2 from 'argon2';
import { db } from '~/db/drizzle';
import { sendVerificationEmail } from '~/lib/nodemailer';
import {
	createUserIdentity,
	findUserByEmail,
	getUserIdentity,
	updateUserIdentity,
	updateUserVerification,
} from '~/repositories/auth.repository';
import {
	basicRegisterRoute,
	basicVerifyAccountRoute,
} from '~/routes/auth.route';
import { createRouter } from '../utils/router-factory';
import { PostgresError } from 'postgres';

export const authRouter = createRouter();
// export const authProtectedRouter = createAuthRouter();

authRouter.openapi(basicRegisterRoute, async (c) => {
	const { email, password } = c.req.valid('json');

	const passwordHash = await argon2.hash(password);
	const verifyTokenExpiration = new Date(new Date().getTime() + 3600); // TTL 1 hour
	const verifyToken = await argon2.hash(
		`${email}${new Date()}${verifyTokenExpiration.toISOString()}`,
	);

	const user = await findUserByEmail(db, email);
	if (user) { 
		if (!user.isVerified && new Date() > new Date(user.verificationTokenExpiration)) 
			// If email already exists and old token expired, regenerate token
			// TODO: Maybe add penalty if regenerate token? wait 1 min, 2 min, 10 min, 60 min
			await updateUserIdentity(db, { verificationToken: verifyToken, verificationTokenExpiration: verifyTokenExpiration })
		else return c.json({ message: 'User already exist' }, 400);
	}

	const newUser = await createUserIdentity(db, {
		email: email,
		hash: passwordHash,
		provider: 'basic',
		isVerified: false,
		verificationToken: verifyToken,
		verificationTokenExpiration: verifyTokenExpiration,
	})

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
