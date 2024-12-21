import { createFactory } from 'hono/factory';
import type { z } from 'zod';
import { db } from '~/db/drizzle';
import type { UserIdentityRolesEnum } from '~/db/schema';
import { findUserIdentityById } from '~/repositories/auth.repository';
import type { JWTPayloadSchema } from '~/types/auth.type';

const factory = createFactory<{
  Variables: {
    user: z.infer<typeof JWTPayloadSchema>;
  };
}>();

export const roleMiddleware = (requestedRole: UserIdentityRolesEnum) => {
  return factory.createMiddleware(async (c, next) => {
    const role = (await findUserIdentityById(db, c.var.user.id))?.role;

    if (role !== requestedRole) {
      return c.json({ message: 'Unauthorized' }, 403);
    }

    await next();
  });
};
