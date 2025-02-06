import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { eventTeam, eventTeamMember, user } from '~/db/schema';
import { UpdateEventTeamSchema } from '~/types/event-team.type';

import {
  EventTeamMemberRelationOption,
  deleteAllEventTeamMemberDocument,
} from './event-team-member.repository';

interface EventTeamRelationOption {
  teamMember?: EventTeamMemberRelationOption | boolean;
  event?: boolean;
  document?: boolean;
  submission?: boolean;
}

export const getUserEventTeams = async (db: Database, userId: string) => {
  const userTeams = (
    await db.query.eventTeamMember.findMany({
      where: eq(eventTeamMember.userId, userId),
      columns: {
        teamId: true,
      },
    })
  ).map((t) => t.teamId);

  return await db.query.eventTeam.findMany({
    where: inArray(eventTeam.id, userTeams),
    with: {
      event: true,
    },
  });
};

export const getEventTeamById = async (
  db: Database,
  teamId: string,
  options?: EventTeamRelationOption,
) => {
  return await db.query.eventTeam.findFirst({
    where: eq(eventTeam.id, teamId),
    with: {
      teamMembers:
        typeof options?.teamMember === 'boolean'
          ? options?.teamMember
            ? true
            : undefined
          : {
              with: {
                user:
                  typeof options?.teamMember?.user === 'boolean'
                    ? options?.teamMember?.user
                      ? true
                      : undefined
                    : {
                        with: {
                          document: options?.teamMember?.user?.document
                            ? { with: { media: true } }
                            : undefined,
                          userIdentity: options?.teamMember?.user?.userIdentity
                            ? true
                            : undefined,
                        },
                      },
                document: options?.teamMember?.document
                  ? { with: { media: true } }
                  : undefined,
              },
            },
      event: options?.event ? true : undefined,
      document: options?.document ? { with: { media: true } } : undefined,
      submission: options?.submission ? { with: { media: true } } : undefined,
    },
  });
};

export const createEventTeam = async (
  db: Database,
  mode: 'solo' | 'team',
  userId: string,
  eventId: string,
  name?: string,
) => {
  if (mode === 'solo') {
    const userReq = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .then(first);

    return await db.transaction(async (trx) => {
      const event_team = await trx
        .insert(eventTeam)
        .values({
          name: userReq?.fullName ?? '',
          eventId,
        })
        .returning()
        .then(first);

      if (!event_team) {
        throw new Error('Failed to create team');
      }

      const event_team_member = await trx.insert(eventTeamMember).values({
        userId,
        teamId: event_team.id,
        role: 'leader',
      });

      return {
        event_team,
        event_team_member,
      };
    });
  } else {
    return await db.transaction(async (trx) => {
      const event_team = await trx
        .insert(eventTeam)
        .values({
          name: name ?? '',
          eventId,
        })
        .returning()
        .then(first);

      if (!event_team) {
        throw new Error('Failed to create team');
      }

      const event_team_member = await trx.insert(eventTeamMember).values({
        userId,
        teamId: event_team?.id,
        role: 'leader',
      });

      return {
        event_team,
        event_team_member,
      };
    });
  }
};

export const updateEventTeam = async (
  db: Database,
  teamId: string,
  values: z.infer<typeof UpdateEventTeamSchema>,
) => {
  return await db
    .update(eventTeam)
    .set(values)
    .where(eq(eventTeam.id, teamId))
    .returning()
    .then(firstSure);
};

export const deleteEventTeam = async (db: Database, teamId: string) => {
  const foundTeam = await getEventTeamById(db, teamId, { teamMember: true });
  if (!foundTeam) return;

  for (const tm of foundTeam.teamMembers) {
    await deleteAllEventTeamMemberDocument(db, tm.userId, teamId);
  }
  return await db
    .delete(eventTeam)
    .where(eq(eventTeam.id, teamId))
    .returning()
    .then(first);
};
