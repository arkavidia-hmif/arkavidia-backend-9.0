import { createFactory } from 'hono/factory';
import type { z } from 'zod';
import { db } from '~/db/drizzle';
import { getTeamById } from '~/repositories/team.repository';
import type { JWTPayloadSchema } from '~/types/auth.type';

const factory = createFactory<{
  Variables: {
    user: z.infer<typeof JWTPayloadSchema>;
  };
}>();

export const isInCompTeamMiddleware = () => {
  return factory.createMiddleware(async (c, next) => {
    const teamId = c.req.param('teamId');

    // Check if team exists
    const team = await getTeamById(db, teamId, { teamMember: true });
    if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

    // Check if user is in team
    const teamMember = team.teamMembers.find(
      (el) => el.userId === c.var.user.id,
    );
    if (!teamMember) return c.json({ error: "User isn't inside team!" }, 403);

    await next();
  });
};


// TODO: Fix this
export const isInEventTeamMiddleware = () => {
  return factory.createMiddleware(async (c, next) => {
    const teamId = c.req.param('teamId');

    // Check if team exists
    const team = await getTeamById(db, teamId, { teamMember: true });
    if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

    // Check if user is in team
    const teamMember = team.teamMembers.find(
      (el) => el.userId === c.var.user.id,
    );
    if (!teamMember) return c.json({ error: "User isn't inside team!" }, 403);

    await next();
  });
};
