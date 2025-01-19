import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user, userDocument } from '~/db/schema';

export const UserDocumentSchema =
  createSelectSchema(userDocument).openapi('UserDocument');
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
