import { db } from '~/db/drizzle';
import { CompetitionTeamVerificationStatusEnum } from '~/db/schema';
import { sendVerificationAcceptEmail } from '~/lib/nodemailer';
import { transformRoleToName } from '~/middlewares/role-access.middleware';
import {
  getAllCompetitions,
  getCompetitionIdByName as getCompetitionByName,
  getCompetitionSubmissionRequirement,
  updateSubmissionFeedback,
} from '~/repositories/competition.repository';
import { updateTeamMemberDocument } from '~/repositories/team-member.repository';
import {
  getAllTeamsPaginated,
  getTeamById,
  getVerdict,
  updateTeam,
  updateTeamDocument,
} from '~/repositories/team.repository';
import { getUser, updateUserDocument } from '~/repositories/user.repository';
import {
  getAdminAllCompetitionTeamsRoute,
  getAdminCompetitionTeamInformationRoute,
  getAdminCompetitionTeamSubmissionsRoute,
  getAdminCompetitionsRoute,
  putAdminCompetitionTeamStatusRoute,
  putAdminCompetitionTeamSubmissionVerdictRoute,
  putAdminCompetitionTeamVerificationRoute,
} from '~/routes/admin-competition.route';
import { createAuthRouter } from '~/utils/router-factory';

export const adminCompetitionProtectedRouter = createAuthRouter();

adminCompetitionProtectedRouter.openapi(
  getAdminCompetitionsRoute,
  async (c) => {
    if (c.var.user.role === 'admin' || c.var.user.role === 'admin_competition')
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
      competition: true,
    });

    if (!team) return c.json({ error: "Team doesn't exist!" }, 400);
    if (team.competition.id !== competitionId)
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

    const team = await getTeamById(db, teamId, {
      competition: true,
      teamMember: true,
    });
    if (!team || team.competition.id !== competitionId)
      return c.json({ error: "Team doesn't exist!" }, 400);

    if (team.verificationStatus === 'INCOMPLETE')
      return c.json({ error: "You can't verify an incomplete team yet!" });

    if (buktiPembayaran) await updateTeamDocument(db, teamId, buktiPembayaran);
    if (teamMember) {
      for (const member of teamMember) {
        if (member && member.poster)
          await updateTeamMemberDocument(
            db,
            member.userId,
            teamId,
            'poster',
            member.poster,
          );

        if (member && member.twibbon)
          await updateTeamMemberDocument(
            db,
            member.userId,
            teamId,
            'twibbon',
            member.twibbon,
          );

        if (member && member.kartuIdentitas)
          await updateUserDocument(db, member.userId, {
            ...member.kartuIdentitas,
            type: 'kartu-identitas',
          });
      }
    }

    const { verdict, errorCount } = await getVerdict(
      db,
      teamId,
      team.teamMembers,
    );
    const verificationStatus: CompetitionTeamVerificationStatusEnum = verdict
      ? 'VERIFIED'
      : errorCount > 0
        ? 'DENIED'
        : 'ON REVIEW';
    const updatedTeam = await updateTeam(db, teamId, { verificationStatus });

    if (verificationStatus === 'VERIFIED') {
      await Promise.all(
        teamMember.map(async (tm) => {
          const user = await getUser(db, tm?.userId as string);
          if (!user) return;

          await sendVerificationAcceptEmail(
            user.email,
            team.name,
            team.competition.title,
          );
        }),
      );
    }

    return c.json(updatedTeam, 200);
  },
);

adminCompetitionProtectedRouter.openapi(
  putAdminCompetitionTeamStatusRoute,
  async (c) => {
    const { finalStatus, preeliminaryStatus } = c.req.valid('json');
    const { competitionId, teamId } = c.req.valid('param');

    if (!finalStatus && !preeliminaryStatus)
      return c.json(
        { error: 'At least one of the values must be supplied!' },
        400,
      );

    const team = await getTeamById(db, teamId, {
      competition: true,
      teamMember: true,
    });
    if (!team || team.competition.id !== competitionId)
      return c.json({ error: "Team doesn't exist!" }, 400);

    if (finalStatus) await updateTeam(db, teamId, { finalStatus });
    if (preeliminaryStatus)
      await updateTeam(db, teamId, { preeliminaryStatus });

    const updatedTeam = await getTeamById(db, teamId, {});

    return c.json(updatedTeam, 200);
  },
);

adminCompetitionProtectedRouter.openapi(
  putAdminCompetitionTeamSubmissionVerdictRoute,
  async (c) => {
    const { competitionId, teamId, typeId } = c.req.valid('param');
    const { judgeResponse } = c.req.valid('json');

    const team = await getTeamById(db, teamId, {
      competition: true,
      submission: true,
    });

    if (!team || team.competition.id !== competitionId)
      return c.json({ error: "Team doesn't exist!" }, 400);

    if (!team.submission.find((s) => s.typeId === typeId))
      return c.json({ error: "Submission doesn't exist!" }, 400);

    const updatedSubmission = await updateSubmissionFeedback(
      db,
      teamId,
      typeId,
      judgeResponse,
    );

    return c.json(updatedSubmission, 200);
  },
);
