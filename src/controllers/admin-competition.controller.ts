import { db } from '~/db/drizzle';
import { TeamVerificationStatusEnum } from '~/db/schema';
import { transformRoleToName } from '~/middlewares/role-access.middleware';
import {
  getAllCompetitions,
  getCompetitionIdByName as getCompetitionByName,
  getCompetitionSubmissionRequirement,
} from '~/repositories/competition.repository';
import { updateTeamMemberDocument } from '~/repositories/team-member.repository';
import {
  getAllTeamsPaginated,
  getTeamById,
  updateTeam,
  updateTeamDocument,
} from '~/repositories/team.repository';
import { updateUserDocument } from '~/repositories/user.repository';
import {
  getAdminAllCompetitionTeamsRoute,
  getAdminCompetitionTeamInformationRoute,
  getAdminCompetitionTeamSubmissionsRoute,
  getAdminCompetitionsRoute,
  putAdminCompetitionTeamVerificationRoute,
} from '~/routes/admin-competition.route';
import { createAuthRouter } from '~/utils/router-factory';

export const adminCompetitionProtectedRouter = createAuthRouter();

adminCompetitionProtectedRouter.openapi(
  getAdminCompetitionsRoute,
  async (c) => {
    if (
      c.var.user.role === 'superadmin' ||
      c.var.user.role === 'admin_competition'
    )
      return c.json(await getAllCompetitions(db), 200);

    const competitionName = transformRoleToName(c.var.user.role);
    const competitions = await getCompetitionByName(db, competitionName);
    return c.json(competitions, 200);
  },
);

adminCompetitionProtectedRouter.openapi(
  getAdminAllCompetitionTeamsRoute,
  async (c) => {
    const { page, limit } = c.req.valid('query');
    const { competitionId } = c.req.valid('param');

    const competitionParticipant = await getAllTeamsPaginated(
      db,
      competitionId,
      { page: Number(page), limit: Number(limit) },
    );
    return c.json(competitionParticipant, 200);
  },
);

adminCompetitionProtectedRouter.openapi(
  getAdminCompetitionTeamInformationRoute,
  async (c) => {
    const { teamId, competitionId } = c.req.valid('param');

    const team = await getTeamById(db, teamId, {
      document: true,
      teamMember: { document: true, user: { document: true } },
      competition: true,
    });

    if (team?.competition.id !== competitionId)
      return c.json({ error: "Team isn't in competition!" }, 400);

    return c.json(team, 200);
  },
);

adminCompetitionProtectedRouter.openapi(
  getAdminCompetitionTeamSubmissionsRoute,
  async (c) => {
    const { teamId, competitionId } = c.req.valid('param');

    const team = await getTeamById(db, teamId, {
      submission: true,
      teamMember: true,
    });

    if (!team) return c.json({ error: "Team doesn't exist!" }, 400);
    if (team?.competition.id !== competitionId)
      return c.json({ error: "Team isn't in competition!" }, 400);

    const requirements = await getCompetitionSubmissionRequirement(
      db,
      team?.competitionId,
    );

    const result = requirements.map((r) => {
      const submission = team.submission.find((s) => s.typeId === r.typeId);
      return {
        requirement: r,
        submission,
      };
    });

    // Grouping result, kalo ada prelim ya prelim doang tapi kalo ada final dua2nya
    const groupedResult = Object.groupBy(
      result,
      ({ requirement }) => requirement.stage,
    );

    return c.json(groupedResult, 200);
  },
);

adminCompetitionProtectedRouter.openapi(
  putAdminCompetitionTeamVerificationRoute,
  async (c) => {
    const { competitionId, teamId } = c.req.valid('param');
    const { buktiPembayaran, teamMember } = c.req.valid('json');

    const team = await getTeamById(db, teamId, { competition: true });
    if (!team || team.competition.id !== competitionId)
      return c.json({ error: "Team doesn't exist!" }, 400);

    let verdict: boolean = true;
    verdict =
      verdict &&
      !(await updateTeamDocument(db, teamId, buktiPembayaran))[0].isVerified
        ? false
        : verdict;
    for (const member of teamMember) {
      if (member.poster)
        verdict =
          verdict &&
          !(
            await updateTeamMemberDocument(
              db,
              member.userId,
              teamId,
              'poster',
              member.poster,
            )
          )[0].isVerified;
      if (member.twibbon)
        verdict =
          verdict &&
          !(
            await updateTeamMemberDocument(
              db,
              member.userId,
              teamId,
              'twibbon',
              member.twibbon,
            )
          )[0].isVerified;
      if (member.kartuIdentitas)
        verdict =
          verdict &&
          !(
            await updateUserDocument(db, member.userId, {
              ...member.kartuIdentitas,
              type: 'kartu-identitas',
            })
          )[0].isVerified;
    }

    const verificationStatus: TeamVerificationStatusEnum = verdict
      ? 'VERIFIED'
      : 'DENIED';
    const updatedTeam = await updateTeam(db, teamId, { verificationStatus });

    // TODO: Send email to team if not verified / verified

    return c.json(updatedTeam, 200);
  },
);
