import { db } from '~/db/drizzle';
import { deleteEventTeamMember } from '~/repositories/event-team-member.repository';
import {
  createEventTeam,
  deleteEventTeam,
  getEventTeamById,
  getUserEventTeams,
  updateEventTeam,
} from '~/repositories/event-team.repository';
import {
  deleteEventTeamMemberRoute,
  getEventTeamByTeamIdRoute,
  getEventTeamRoute,
  postCreateEventTeamRoute,
  postCreateEventTeamSoloRoute,
  postQuitEventTeamRoute,
  putChangeEventTeamNameRoute,
} from '~/routes/event-team.route';
import { createAuthRouter } from '~/utils/router-factory';

export const eventTeamProtectedRouter = createAuthRouter();

eventTeamProtectedRouter.openapi(getEventTeamRoute, async (c) => {
  const user = c.var.user;
  const teams = await getUserEventTeams(db, user.id);
  return c.json(teams, 200);
});

eventTeamProtectedRouter.openapi(getEventTeamByTeamIdRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const team = await getEventTeamById(db, teamId, {
    document: true,
    teamMember: { document: true, user: { document: true } },
    event: true,
  });
  return c.json(team, 200);
});

eventTeamProtectedRouter.openapi(postCreateEventTeamSoloRoute, async (c) => {
  try {
    const res = await createEventTeam(
      db,
      'solo',
      c.var.user.id,
      c.req.valid('param').eventId,
    );
    return c.json(res, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500,
      );
    }

    return c.json(
      {
        error: 'Unexpected error occured',
      },
      500,
    );
  }
});

eventTeamProtectedRouter.openapi(postCreateEventTeamRoute, async (c) => {
  try {
    const res = await createEventTeam(
      db,
      'team',
      c.var.user.id,
      c.req.valid('param').eventId,
      c.req.valid('json').name,
    );
    return c.json(res, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500,
      );
    }

    return c.json(
      {
        error: 'Unexpected error occured',
      },
      500,
    );
  }
});

eventTeamProtectedRouter.openapi(putChangeEventTeamNameRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const { name } = c.req.valid('json');
  const updatedTeam = await updateEventTeam(db, teamId, { name });
  return c.json(updatedTeam, 200);
});

eventTeamProtectedRouter.openapi(deleteEventTeamMemberRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const { userId } = c.req.valid('json');

  const team = await getEventTeamById(db, teamId, { teamMember: true });
  const teamMember = team?.teamMembers.find(
    (el) => el.userId === c.var.user.id,
  );
  if (teamMember?.role !== 'leader')
    return c.json({ error: 'You are not the leader of this team!' }, 403);

  // check if the deleted team member is in the same team
  const deletedTeamMemberId = c.req.valid('json').userId;
  const deletedTeamMember = team?.teamMembers.find(
    (el) => el.userId === deletedTeamMemberId,
  );
  if (!deletedTeamMember)
    return c.json({ error: "Team member doesn't exist!" }, 403);

  const member = await deleteEventTeamMember(db, teamId, userId);

  return c.json(member, 200);
});

eventTeamProtectedRouter.openapi(postQuitEventTeamRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const userId = c.var.user.id;

  const team = await getEventTeamById(db, teamId, { teamMember: true });
  const teamMember = team?.teamMembers.find((el) => el.userId === userId);
  if (teamMember?.role === 'leader') {
    const res = await deleteEventTeam(db, teamId);
    return c.json(res, 200);
  }

  const res = await deleteEventTeamMember(db, teamId, userId);
  return c.json(res, 200);
});
