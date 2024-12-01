import { eq } from 'drizzle-orm';
import type { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { user } from '~/db/schema/user.schema';

export const findUserByEmail = async (db: Database, email: string) => {
	return await db.select().from(user).where(eq(user.email, email)).then(first);
};
