import { and, count, eq } from 'drizzle-orm';
import type { Database } from '~/db/drizzle';
import { UserEducationEnum, user } from '~/db/schema';

export const getUserStatistics = async (
  db: Database,
  education?: UserEducationEnum,
) => {
  const where = education ? eq(user.education, education) : undefined;

  const totalCount = (
    await db.select({ count: count() }).from(user).where(where)
  )[0].count;
  const totalRegisteredCount = (
    await db
      .select({ count: count() })
      .from(user)
      .where(and(where, eq(user.isRegistrationComplete, true)))
  )[0].count;
  const totalConsentCount = (
    await db
      .select({ count: count() })
      .from(user)
      .where(and(where, eq(user.realConsent, true)))
  )[0].count;

  return { totalCount, totalRegisteredCount, totalConsentCount };
};

export const getTeamStatistics = async () => {};
