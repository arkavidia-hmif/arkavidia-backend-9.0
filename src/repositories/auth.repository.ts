import type { Database } from '~/db/drizzle';
import { type UserIdentityInsert, userIdentity } from '~/db/schema/auth.schema';

export const createUserIdentity = async (
	db: Database,
	user: UserIdentityInsert,
) => {
	// Also automatically creates user profile with triggers
	return await db.insert(userIdentity).values(user).returning();
};
