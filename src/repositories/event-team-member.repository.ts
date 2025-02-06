import { and, eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { eventTeam, eventTeamMember } from '~/db/schema';

import { UserRelationOption } from './user.repository';

export interface EventTeamMemberRelationOption {
  user?: UserRelationOption;
  document?: boolean;
}

export const getEventTeamMember = async (
  db: Database,
  teamId: string,
  userId: string,
  options?: EventTeamMemberRelationOption,
) => {
  return await db.query.eventTeamMember.findFirst({
    where: and(
      eq(eventTeamMember.teamId, teamId),
      eq(eventTeamMember.userId, userId),
    ),
    with: {
      document: options?.document ? { with: { media: true } } : undefined,
      user:
        typeof options?.user === 'boolean'
          ? options?.user
            ? true
            : undefined
          : {
              with: {
                document: options?.user?.document
                  ? { with: { media: true } }
                  : undefined,
              },
            },
    },
  });
};

export const getUserEventTeamMember = async (db: Database, userId: string) => {
  return await db.query.eventTeamMember.findMany({
    where: eq(eventTeamMember.userId, userId),
  });
};

export const getEventTeamMemberCount = async (db: Database, teamId: string) => {
  const result = await db.query.eventTeamMember.findMany({
    where: eq(eventTeamMember.teamId, teamId),
    columns: {
      teamId: true,
    },
  });

  return { teamMemberCount: result.length };
};

export const isUserInEventTeam = async (
  db: Database,
  teamId: string,
  userId: string,
) => {
  const x = await db.query.eventTeamMember.findFirst({
    where: and(
      eq(eventTeamMember.teamId, teamId),
      eq(eventTeamMember.userId, userId),
    ),
    columns: { userId: true },
  });
  if (!x) return false;
  return true;
};

export const isUserInOtherTeam = async (
  db: Database,
  userId: string,
  eventId: string,
): Promise<boolean> => {
  const where = and(
    eq(eventTeamMember.userId, userId),
    eq(eventTeam.eventId, eventId),
  );

  const existingTeamMember = await db
    .select()
    .from(eventTeamMember)
    .innerJoin(eventTeam, eq(eventTeamMember.teamId, eventTeam.id))
    .where(where);

  return !!existingTeamMember.length;
};
