import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { type UserIdentityInsert, userIdentity } from '~/db/schema/auth.schema';
import type { UserIdentityUpdateSchema } from '~/types/auth.type';

export const createUserIdentity = async (
	db: Database,
	user: UserIdentityInsert,
) => {
	// Also automatically creates user profile with triggers
	return await db.insert(userIdentity).values(user).returning().then(firstSure);
};

export const findUserIdentityById = async (db: Database, userId: string) => {
	return await db
		.select()
		.from(userIdentity)
		.where(eq(userIdentity.id, userId))
		.then(first);
};

export const findUserIdentityByEmail = async (db: Database, email: string) => {
	return await db
		.select()
		.from(userIdentity)
		.where(eq(userIdentity.email, email))
		.then(first);
};

export const updateUserIdentity = async (
	db: Database,
	userId: string,
	user: z.infer<typeof UserIdentityUpdateSchema>,
) => {
	return await db
		.update(userIdentity)
		.set(user)
		.where(eq(userIdentity.id, userId))
		.returning()
		.then(first);
};

export const updateUserVerification = async (db: Database, userId: string) => {
	return await db
		.update(userIdentity)
		.set({ isVerified: true })
		.where(eq(userIdentity.id, userId))
		.returning()
		.then(first);
};
