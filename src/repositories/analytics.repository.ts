import { and, count, eq } from 'drizzle-orm';
import type { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import {
  CompetitionStageEnum,
  UserEducationEnum,
  competition,
  team,
  user,
} from '~/db/schema';

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

type CompetitionNameEnum =
  | 'Arkalogica'
  | 'CP'
  | 'CTF'
  | 'Datavidia'
  | 'Hackvidia'
  | 'UXvidia';

export const getCompetitionStageStatistics = async (
  db: Database,
  competitionId?: string,
  stage?: CompetitionStageEnum,
) => {
  const where1 = competitionId
    ? eq(team.competitionId, competitionId)
    : undefined;
  const where2 = stage ? eq(team.stage, stage) : undefined;

  return await db
    .select({ count: count() })
    .from(team)
    .where(and(where1, where2))
    .then(firstSure);
};

export const getCompetitionStatistics = async (
  db: Database,
  competitionName?: CompetitionNameEnum,
) => {
  const competitionId = competitionName
    ? (
        await db
          .select({ id: competition.id })
          .from(competition)
          .where(eq(competition.title, competitionName as string))
          .then(firstSure)
      ).id
    : undefined;
  const where = competitionId
    ? eq(team.competitionId, competitionId)
    : undefined;

  const totalCount = (
    await db.select({ count: count() }).from(team).where(where).then(firstSure)
  ).count;

  const verifiedCount = (
    await db
      .select({ count: count() })
      .from(team)
      .where(and(where, eq(team.verificationStatus, 'VERIFIED')))
      .then(firstSure)
  ).count;

  const stage = {
    preeliminary: (
      await getCompetitionStageStatistics(db, competitionId, 'pre-eliminary')
    ).count,
    // verification: (
    //   await getCompetitionStageStatistics(db, competitionId, 'verification')
    // ).count,
    final: (await getCompetitionStageStatistics(db, competitionId, 'final'))
      .count,
  };

  return { count: totalCount, verifiedCount, stage };
};
