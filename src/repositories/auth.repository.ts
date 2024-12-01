import { eq } from 'drizzle-orm';
import { Data } from 'node_modules/hono/dist/types/context';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { type UserIdentityInsert, userIdentity } from '~/db/schema/auth.schema';
import { user } from '~/db/schema/user.schema';
import type { UserIdentityInsertSchema } from '~/types/auth.type';

export const createUserIdentity = async (
	db: Database,
	user: UserIdentityInsert,
) => {
	// Also automatically creates user profile with triggers
	return await db.insert(userIdentity).values(user).returning().then(firstSure);
};

export const getUserIdentity = async (db: Database, userId: string) => {
	return await db
		.select()
		.from(userIdentity)
		.where(eq(userIdentity.id, userId))
		.then(first);
};

export const updateUserIdentity = async (
	db: Database,
	userId: string,
	user: z.infer<typeof UserIdentityInsertSchema>,
) => {
	return await db.update(userIdentity).set(user).returning().then(first);
};

export const updateUserVerification = async (db: Database, userId: string) => {
	return await db
		.update(userIdentity)
		.set({ isVerified: true })
		.where(eq(userIdentity.id, userId))
		.returning()
		.then(first);
};

export const findUserIdentityByEmail = async (db: Database, email: string) => {
	return await db
		.select()
		.from(userIdentity)
		.where(eq(userIdentity.email, email))
		.then(first);
};

export const findUserByEmail = async (db: Database, email: string) => {
	return await db.select().from(user).where(eq(user.email, email)).then(first);
};
