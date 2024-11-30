import * as argon2 from 'argon2';
import { db } from '~/db/drizzle';
import { sendVerificationEmail } from '~/lib/nodemailer';
import { createUserIdentity } from '~/repositories/auth.repository';
import { basicRegisterRoute } from '~/routes/auth.route';
import { createRouter } from '../utils/router-factory';

export const authRouter = createRouter();
// export const authProtectedRouter = createAuthRouter();

authRouter.openapi(basicRegisterRoute, async (c) => {
	const body = c.req.valid('json');

	const passwordHash = await argon2.hash(body.password);
	const verifyTokenExpiration = new Date(new Date().getTime() + 86400000); // TTL 1 day
	const verifyToken = await argon2.hash(
		`${body.email}${new Date()}${verifyTokenExpiration.toISOString()}`,
	);

	console.log(passwordHash, verifyToken, verifyTokenExpiration);

	const user = await createUserIdentity(db, {
		email: body.email,
		hash: passwordHash,
		provider: 'basic',
		isVerified: false,
		verificationToken: verifyToken,
		verificationTokenExpiration: verifyTokenExpiration,
	});

	if (user.length <= 0) return c.json({ message: 'Walah cik napa ini' }, 400);

	await sendVerificationEmail(body.email, verifyToken);
	return c.json({}, 204);
});
