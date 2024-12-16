import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from '~/db/schema';

export const UserSchema = createSelectSchema(user, {
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
}).openapi('User');

export const UserUpdateSchema = createInsertSchema(user).partial();

export const UpdateUserBodyRoute = UserUpdateSchema.omit({
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  isRegistrationComplete: true,
});
