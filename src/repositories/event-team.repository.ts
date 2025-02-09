import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { eventTeam, eventTeamMember, user } from '~/db/schema';

export const createEventTeam = async (
  db: Database,
  mode: 'solo' | 'team',
  userId: string,
  eventId: string,
  name?: string,
) => {
  // Check if user is already in a team
  const userTeam = await db
    .select()
    .from(eventTeamMember)
    .where(eq(eventTeamMember.userId, userId))
    .then(first);

  if (userTeam) {
    throw new Error('User is already registered!');
  }

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

export const getEventTeam = async (db: Database, userId: string) => {
  return await db
    .select()
    .from(eventTeam)
    .innerJoin(eventTeamMember, eq(eventTeam.id, eventTeamMember.teamId))
    .where(eq(eventTeamMember.userId, userId));
};

export const getEventTeamById = async (db: Database, teamId: string) => {
  return await db
    .select()
    .from(eventTeam)
    .innerJoin(eventTeamMember, eq(eventTeam.id, eventTeamMember.teamId))
    .where(eq(eventTeam.id, teamId))
    .then(first);
};

// TODO: Implement putEventTeam
