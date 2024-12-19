import { db } from '~/db/drizzle';
import { findUserById, updateUser } from '~/repositories/user.repository';
import { getUserRoute, updateUserRoute } from '~/routes/user.route';
import { createAuthRouter } from '~/utils/router-factory';

export const userProtectedRouter = createAuthRouter();

userProtectedRouter.openapi(getUserRoute, async (c) => {
  const user = c.var.user;
  const findUser = await findUserById(db, user.id);
  if (!findUser) return c.json({ message: 'User not found!' }, 400);
  return c.json(findUser, 200);
});

userProtectedRouter.openapi(updateUserRoute, async (c) => {
  const body = c.req.valid('json');
  const user = await findUserById(db, c.var.user.id);

  if (!user) return c.json({ message: 'User not found!' }, 400);
  // Kalau udah 'isRegistrationComplete' consent gak boleh diubah
  if (user.isRegistrationComplete && typeof body.consent === 'boolean')
    return c.json({ message: 'You cannot change consent.' }, 400);

  const values = {
    ...body,
    isRegistrationComplete: !user.isRegistrationComplete
      ? true
      : user.isRegistrationComplete,
    consent: !user.isRegistrationComplete ? body.consent : user.consent,
  };

  const updatedUser = await updateUser(db, user.id, values);
  return c.json(updatedUser, 200);
});
