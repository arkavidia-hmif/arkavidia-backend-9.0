import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user, userDocument, userIdentityRoleEnum } from '~/db/schema';

import { MediaSchema } from './media.type';

export const UserDocumentSchema = createSelectSchema(userDocument)
  .merge(
    z.object({
      media: MediaSchema,
    }),
  )
  .openapi('UserDocument');
export const UpdateUserDocumentSchema =
  createInsertSchema(userDocument).partial();
export const CreateUserDocumentSchema = createInsertSchema(userDocument).omit({
  userId: true,
});

export const UserSchema = createSelectSchema(user, {
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
})
  .merge(
    z.object({
      document: z.array(UserDocumentSchema).optional(),
      role: z.enum(userIdentityRoleEnum.enumValues).optional(),
    }),
  )
  .openapi('User');

export const UserUpdateSchema = createInsertSchema(user).partial();

export const UpdateUserBodySchema = UserUpdateSchema.omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  isRegistrationComplete: true,
});

export const UpdateUserDocumentRouteSchema = z.object({
  nisnMediaId: z.string().optional(),
  kartuMediaId: z.string().optional(),
});
