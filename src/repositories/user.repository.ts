import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { user } from '~/db/schema/user.schema';
import type { UserUpdateSchema } from '~/types/auth.type';

export const findUserByEmail = async (db: Database, email: string) => {
	return await db.select().from(user).where(eq(user.email, email)).then(first);
};

export const findUserById = async (db: Database, id: string) => {
	return await db.select().from(user).where(eq(user.id, id)).then(first);
};

export const updateUser = async (
	db: Database,
	userId: string,
	userData: z.infer<typeof UserUpdateSchema>,
) => {
	return await db
		.update(user)
		.set(userData)
		.where(eq(user.id, userId))
		.returning()
		.then(first);
};
