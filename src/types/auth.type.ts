import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userIdentity } from '~/db/schema/auth.schema';
import { user } from '~/db/schema/user.schema';

export const UserIdentitySchema = createSelectSchema(userIdentity);

export const UserIdentityInsertSchema =
	createInsertSchema(userIdentity).partial();

export const UserSchema = createSelectSchema(user).openapi('User');

export const JWTPayloadSchema = UserSchema.merge(
	UserIdentitySchema.pick({ provider: true }),
).openapi('JWTPayload');

export const BasicLoginBodySchema = z.object({
	email: z.string().email(),
	password: z.string(),
});

export const BasicRegisterBodySchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(8, 'Password must have minimum length of 8'),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirm'], // path of error
	});

export const BasicVerifyAccountQuerySchema = z.object({
	user: z.string().openapi({
		param: {
			in: 'query',
			required: true,
		},
	}),
	token: z.string().openapi({
		param: {
			in: 'query',
			required: true,
		},
	}),
});

export const AccessRefreshTokenSchema = z
	.object({
		accessToken: z.string(),
		refreshToken: z.string(),
	})
	.openapi('AccessRefreshToken');

export const AccessTokenSchema = AccessRefreshTokenSchema.pick({
	accessToken: true,
}).openapi('AccessToken');
