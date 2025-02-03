import { db } from '~/db/drizzle';
import {
  getCompetitionById,
  getCompetitionSubmissionRequirement,
  getCompetitionSubmissionRequirementById,
} from '~/repositories/competition.repository';
import {
  deleteTeamMember,
  getTeamMemberCount,
  isUserInOtherTeam,
} from '~/repositories/team-member.repository';
import {
  changeTeamName,
  createTeam,
  createTeamSubmission,
  deleteTeam,
  getTeamByCode,
  getTeamById,
  getUserTeams,
  inferVerificationStatus,
  insertUserToTeam,
  updatePaymentProofTeam,
  updateTeam,
} from '~/repositories/team.repository';
import { getUser } from '~/repositories/user.repository';
import {
  deleteTeamMemberRoute,
  getTeamByIdRoute,
  getTeamSubmissionRoute,
  getTeamsRoute,
  joinTeamByCodeRoute,
  postCreateTeamRoute,
  postQuitTeamRoute,
  putChangeTeamNameRoute,
  putTeamDocumentRoute,
  putTeamSubmissionRoute,
} from '~/routes/team.route';
import { createAuthRouter } from '~/utils/router-factory';

export const teamProtectedRouter = createAuthRouter();

teamProtectedRouter.openapi(getTeamByIdRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const team = await getTeamById(db, teamId, {
    document: true,
    teamMember: { document: true, user: { document: true } },
    competition: true,
  });
  return c.json(team, 200);
});

teamProtectedRouter.openapi(getTeamsRoute, async (c) => {
  const user = c.var.user;
  const teams = await getUserTeams(db, user.id);
  return c.json(teams, 200);
});

teamProtectedRouter.openapi(postCreateTeamRoute, async (c) => {
  try {
    const { competitionId, name } = await c.req.json();
    const userId = c.var.user.id;

    const user = await getUser(db, userId);
    const competition = await getCompetitionById(db, competitionId);
    if (competition?.title === 'Arkalogica' && user?.education !== 'sma')
      return c.json({ error: 'You must be in SMA to join Arkalogica' }, 403);

    const isInOtherTeam = await isUserInOtherTeam(db, userId, competitionId);
    if (isInOtherTeam) {
      throw new Error('User is already in another team for the competition!');
    }

    const team = await createTeam(db, competitionId, name);
    await insertUserToTeam(db, team.id, userId);
    return c.json(team, 200);
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

teamProtectedRouter.openapi(putChangeTeamNameRoute, async (c) => {
  const { teamId } = c.req.valid('param');

  // Check if team exists
  const team = await getTeamById(db, teamId, { teamMember: true });
  if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

  // Check if user is in team
  const user = c.var.user;
  const teamMember = team.teamMembers.find((el) => el.userId === user.id);
  if (!teamMember) return c.json({ error: "User isn't inside team!" }, 403);

  // check if user is the leader
  if (teamMember.role !== 'leader')
    return c.json({ error: 'You are not the leader of this team!' }, 403);

  const updatedTeam = await changeTeamName(db, teamId, c.req.valid('json'));
  return c.json(updatedTeam, 200);
});

teamProtectedRouter.openapi(deleteTeamMemberRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const { userId } = c.req.valid('json');

  const team = await getTeamById(db, teamId, { teamMember: true });
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

  const member = await deleteTeamMember(db, teamId, userId);

  return c.json(member, 200);
});

teamProtectedRouter.openapi(postQuitTeamRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const userId = c.var.user.id;

  const team = await getTeamById(db, teamId, { teamMember: true });
  const teamMember = team?.teamMembers.find((el) => el.userId === userId);
  if (teamMember?.role === 'leader') {
    const res = await deleteTeam(db, teamId);
    return c.json(res, 200);
  }

  const res = await deleteTeamMember(db, teamId, userId);
  return c.json(res, 200);
});

teamProtectedRouter.openapi(putTeamDocumentRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const { paymentProofMediaId } = c.req.valid('json');

  // Check if team exists
  const team = await getTeamById(db, teamId, { teamMember: true });
  if (team?.verificationStatus === 'VERIFIED')
    return c.json({ error: 'Your team is already verified!' }, 403);

  await updatePaymentProofTeam(db, teamId, paymentProofMediaId);

  const verificationStatus =
    team?.verificationStatus === 'DENIED'
      ? 'CHANGED'
      : await inferVerificationStatus(db, teamId);
  await updateTeam(db, teamId, { verificationStatus });

  const updatedTeam = await getTeamById(db, teamId, {
    document: true,
    competition: true,
  });

  return c.json(updatedTeam, 200);
});

teamProtectedRouter.openapi(getTeamSubmissionRoute, async (c) => {
  const { teamId } = c.req.valid('param');

  const team = await getTeamById(db, teamId, {
    submission: true,
    teamMember: true,
  });

  const requirements = await getCompetitionSubmissionRequirement(
    db,
    team?.competitionId as string,
  );

  const result = requirements.map((r) => {
    const submission = team?.submission.find((s) => s.typeId === r.typeId);
    return {
      requirement: r,
      submission,
    };
  });

  // Kalo masih preeliminary, keluarin preeliminary aja. Kalo final ya return aja semua
  const filteredResult =
    team?.stage === 'pre-eliminary'
      ? result.filter((r) => r.requirement.stage === 'pre-eliminary')
      : result;

  return c.json(filteredResult, 200);
});

teamProtectedRouter.openapi(putTeamSubmissionRoute, async (c) => {
  const { teamId } = c.req.valid('param');
  const { typeId, mediaId } = c.req.valid('json');

  if (!mediaId || !typeId)
    return c.json({ error: 'Type ID and Media ID must be supplied!' }, 400);

  const team = await getTeamById(db, teamId, {
    teamMember: true,
    competition: true,
  });
  const requirement = await getCompetitionSubmissionRequirementById(db, typeId);

  if (requirement?.competitionId !== team?.competition.id)
    return c.json(
      { error: "Requirement type ID isn't for your team competition!" },
      403,
    );
  if (requirement?.stage !== team?.stage)
    return c.json(
      { error: `Your team isn't in ${requirement?.stage} stage!` },
      403,
    );
  const teamSubmission = await createTeamSubmission(
    db,
    teamId,
    c.req.valid('json'),
  );

  return c.json(teamSubmission, 200);
});

teamProtectedRouter.openapi(joinTeamByCodeRoute, async (c) => {
  const { teamCode } = c.req.valid('json');
  const userId = c.var.user.id;

  // Check if the team exists
  const team = await getTeamByCode(db, teamCode);
  if (!team) {
    return c.json({ error: "Team doesn't exist!" }, 400);
  }

  // Get all competition IDs
  const competitionId = team.competitionId;

  // Check if user is in any other team across all competitions
  const isInOtherTeam = await isUserInOtherTeam(db, userId, competitionId);
  if (isInOtherTeam) {
    return c.json(
      { error: 'User is already in another team for a competition!' },
      400,
    );
  }

  // Ensure team is not full
  const { teamMemberCount } = await getTeamMemberCount(db, team.id);
  const maxParticipants = (await getCompetitionById(db, team.competitionId))
    ?.maxParticipants;
  if (teamMemberCount >= (maxParticipants ?? 0)) {
    return c.json({ error: 'Team is already full!' }, 400);
  }

  // Add user to  team
  const newTeamMember = await insertUserToTeam(db, team.id, userId);

  return c.json(newTeamMember, 200);
});
