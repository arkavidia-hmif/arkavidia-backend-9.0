import { db } from '~/db/drizzle';
import {
  deleteEventTeamMember,
  getEventTeamMemberCount,
  insertUserToEventTeam,
  isUserInOtherEventTeam,
} from '~/repositories/event-team-member.repository';
import {
  createEventTeam,
  deleteEventTeam,
  getEventTeamByCode,
  getEventTeamById,
  getUserEventTeams,
  updateEventTeam,
} from '~/repositories/event-team.repository';
import {
  createEventTeamSubmission,
  getEventById,
  getEventSubmissionRequirement,
  getEventSubmissionRequirementById,
} from '~/repositories/event.repository';
import {
  deleteEventTeamMemberRoute,
  getEventTeamByTeamIdRoute,
  getEventTeamRoute,
  getEventTeamSubmissionRoute,
  joinEventTeamByCodeRoute,
  postCreateEventTeamRoute,
  postCreateEventTeamSoloRoute,
  postQuitEventTeamRoute,
  putChangeEventTeamNameRoute,
  putEventTeamSubmissionRoute,
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
  const userTeams = await getUserEventTeams(db, c.var.user.id);
  if (userTeams.length >= 1)
    return c.json({ error: 'You can only join 1 Academya path.' }, 403);

  try {
    const res = await createEventTeam(
      db,
      'solo',
      c.var.user.id,
      c.req.valid('json').eventId,
    );

    const team = await getEventTeamById(db, res.event_team.id, {
      document: true,
      teamMember: { document: true, user: { document: true } },
      event: true,
    });

    return c.json(team, 201);
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
  const userTeams = await getUserEventTeams(db, c.var.user.id);
  if (userTeams.length >= 1)
    return c.json({ error: 'You can only join 1 Academya path.' }, 403);

  try {
    const res = await createEventTeam(
      db,
      'team',
      c.var.user.id,
      c.req.valid('json').eventId,
      c.req.valid('json').name,
    );

    const team = await getEventTeamById(db, res.event_team.id, {
      document: true,
      teamMember: { document: true, user: { document: true } },
      event: true,
    });

    return c.json(team, 201);
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

eventTeamProtectedRouter.openapi(joinEventTeamByCodeRoute, async (c) => {
  const { teamCode } = c.req.valid('json');
  const userId = c.var.user.id;

  const userTeams = await getUserEventTeams(db, userId);
  if (userTeams.length >= 1)
    return c.json({ error: 'You can only join 1 Academya path.' }, 403);

  // Check if the team exists
  const team = await getEventTeamByCode(db, teamCode);
  if (!team) {
    return c.json({ error: "Team doesn't exist!" }, 400);
  }

  // Get all event IDs
  const eventId = team.eventId;

  // Check if user is in any other team across all events
  const isInOtherTeam = await isUserInOtherEventTeam(db, userId, eventId);
  if (isInOtherTeam) {
    return c.json(
      { error: 'User is already in another team for a event!' },
      400,
    );
  }

  // Ensure team is not full
  const { teamMemberCount } = await getEventTeamMemberCount(db, team.id);
  const maxTeamMember = (await getEventById(db, team.eventId))?.maxTeamMember;
  if (teamMemberCount >= (maxTeamMember ?? 0)) {
    return c.json({ error: 'Team is already full!' }, 400);
  }

  // Add user to  team

  const newTeamMember = await insertUserToEventTeam(db, team.id, userId);
  await updateEventTeam(db, team.id, { verificationStatus: 'INCOMPLETE' });

  return c.json(newTeamMember, 200);
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

eventTeamProtectedRouter.openapi(getEventTeamSubmissionRoute, async (c) => {
  const { teamId } = c.req.valid('param');

  const team = await getEventTeamById(db, teamId, {
    submission: true,
    teamMember: true,
  });

  const requirements = await getEventSubmissionRequirement(
    db,
    team?.eventId as string,
  );

  const result = requirements.map((r) => {
    const submission = team?.submission.find((s) => s.typeId === r.typeId);
    return {
      requirement: r,
      submission,
    };
  });

  // Kalo masih preeliminary, keluarin preeliminary aja. Kalo final ya return aja semua
  // const filteredResult =
  //   team?.stage === 'pre-eliminary'
  //     ? result.filter((r) => r.requirement.stage === 'pre-eliminary')
  //     : result;

  return c.json(result, 200);
});

eventTeamProtectedRouter.openapi(putEventTeamSubmissionRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const { typeId, mediaId } = c.req.valid('json');

  if (!mediaId || !typeId)
    return c.json({ error: 'Type ID and Media ID must be supplied!' }, 400);

  const team = await getEventTeamById(db, teamId, {
    teamMember: true,
    event: true,
  });
  const requirement = await getEventSubmissionRequirementById(db, typeId);

  if (requirement?.eventId !== team?.event.id)
    return c.json(
      { error: "Requirement type ID isn't for your team event!" },
      403,
    );
  // if (requirement?.stage !== team?.stage)
  //   return c.json(
  //     { error: `Your team isn't in ${requirement?.stage} stage!` },
  //     403,
  //   );
  const teamSubmission = await createEventTeamSubmission(
    db,
    teamId,
    c.req.valid('json'),
  );

  return c.json(teamSubmission, 200);
});
