import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userIdentity } from '~/db/schema/auth.schema';

export const UserIdentitySchema = createInsertSchema(userIdentity).partial();

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
