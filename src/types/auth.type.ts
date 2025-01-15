import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userIdentity } from '~/db/schema/auth.schema';

import { UserSchema } from './user.type';

export const UserIdentitySchema = createSelectSchema(userIdentity);

export const UserIdentityUpdateSchema =
  createInsertSchema(userIdentity).partial();

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

export const BypassRegisterBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must have minimum length of 8'),
    confirmPassword: z.string(),
    role: z.enum(['admin', 'user']).default('user'),
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

export const GoogleCallbackQuerySchema = z.object({
  code: z.string().openapi({
    param: {
      in: 'query',
      example: '4/0AY0e-g7Qj6y2v7zR7iJ2b9b4V6K7zrZ9X0q4Q',
    },
  }),
});

export const GoogleLoginAccessTokenSchema = z.object({
  accessToken: z.string(),
});

export const AccessTokenSchema = z
  .object({
    accessToken: z.string(),
  })
  .openapi('AccessTokenSchema');

export const GoogleTokenDataSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
  id_token: z.string(),
});

export const GoogleUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().optional(),
  email: z.string(),
  email_verified: z.string().optional(),
  locale: z.string().optional(),
  hd: z.string().optional(),
});
