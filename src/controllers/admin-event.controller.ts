import { db } from '~/db/drizzle';
import { EventTeamVerificationStatusEnum } from '~/db/schema';
import { sendVerificationAcceptEmail } from '~/lib/nodemailer';
import { transformRoleToName } from '~/middlewares/role-access.middleware';
import { updateEventTeamMemberDocument } from '~/repositories/event-team-member.repository';
import {
  getAllEventTeamsPaginated,
  getEventTeamById,
  getEventVerdict,
  isAllEventDocumentsPresent,
  updateEventTeam,
  updateEventTeamDocument,
  updateEventTeamStatus,
} from '~/repositories/event-team.repository';
import {
  getEvent,
  getEventByTitle,
  getEventSubmissionRequirement,
  updateEventSubmissionFeedback,
} from '~/repositories/event.repository';
import { getUser, updateUserDocument } from '~/repositories/user.repository';
import {
  getAdminAllEventTeamsRoute,
  getAdminEventTeamInformationRoute,
  getAdminEventTeamSubmissionsRoute,
  getAdminEventsRoute,
  putAdminEventTeamStatusRoute,
  putAdminEventTeamSubmissionVerdictRoute,
  putAdminEventTeamVerificationRoute,
} from '~/routes/admin-event.route';
import { createAuthRouter } from '~/utils/router-factory';

export const adminEventProtectedRouter = createAuthRouter();

adminEventProtectedRouter.openapi(getAdminEventsRoute, async (c) => {
  if (c.var.user.role === 'admin' || c.var.user.role === 'admin_event')
    return c.json(await getEvent(db), 200);

  const eventName = transformRoleToName(c.var.user.role);
  const events = await getEventByTitle(db, eventName);
  return c.json(events, 200);
});

adminEventProtectedRouter.openapi(getAdminAllEventTeamsRoute, async (c) => {
  const { eventId } = c.req.valid('param');

  const eventParticipant = await getAllEventTeamsPaginated(
    db,
    eventId,
    c.req.valid('query'),
  );
  return c.json(eventParticipant, 200);
});

adminEventProtectedRouter.openapi(
  getAdminEventTeamInformationRoute,
  async (c) => {
    return c.json({}, 200);
  },
);

adminEventProtectedRouter.openapi(
  getAdminEventTeamSubmissionsRoute,
  async (c) => {
    const { teamId, eventId } = c.req.valid('param');

    const team = await getEventTeamById(db, teamId, {
      event: true,
      teamMember: true,
      submission: true,
    });

    if (!team) return c.json({ error: "Team doesn't exist!" }, 400);
    if (team.eventId !== eventId)
      return c.json({ error: "Team isn't in the event!" }, 400);

    const requirements = await getEventSubmissionRequirement(db, eventId);

    const result = requirements.map((r) => {
      const submission = team.submission.find((s) => s.typeId === r.typeId);

      return {
        requirement: r,
        submission,
      };
    });

    const groupedResult = Object.groupBy(
      result,
      ({ requirement }) => requirement.stage,
    );

    return c.json({ groupedResult }, 200);
  },
);

adminEventProtectedRouter.openapi(
  putAdminEventTeamVerificationRoute,
  async (c) => {
    const { eventId, teamId } = c.req.valid('param');
    const { buktiPembayaran, teamMember } = c.req.valid('json');

    const team = await getEventTeamById(db, teamId, {
      event: true,
      teamMember: true,
    });

    if (!team || team.event.id !== eventId)
      return c.json({ error: "Team doesn't exist!" }, 400);

    if (buktiPembayaran) await updateEventTeamDocument(db, teamId, buktiPembayaran);
    if (teamMember) {
      for (const member of teamMember) {
        if (member && member.poster)
          await updateEventTeamMemberDocument(
            db,
            member.userId,
            teamId,
            'poster',
            member.poster,
          );

        if (member && member.twibbon)
          await updateEventTeamMemberDocument(
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

    const { verdict, errorCount } = await getEventVerdict(
      db,
      teamId,
      team.teamMembers,
    );

    const verificationStatus: EventTeamVerificationStatusEnum =
      !(await isAllEventDocumentsPresent(db, teamId, team.teamMembers))
        ? 'INCOMPLETE'
        : verdict
          ? 'VERIFIED'
          : errorCount > 0
            ? 'DENIED'
            : 'ON REVIEW';

    const updatedTeam = await updateEventTeam(db, teamId, { verificationStatus });        
    
    if (verificationStatus === 'VERIFIED') {
      await Promise.all(
        team.teamMembers.map(async (tm) => {
          const user = await getUser(db, tm?.userId as string);
          if (!user) return;

          await sendVerificationAcceptEmail(
            user.email,
            team.name,
            team.event.title,
          );
        }),
      );
    }

    return c.json(updatedTeam, 200);
  },
);

adminEventProtectedRouter.openapi(putAdminEventTeamStatusRoute, async (c) => {
  const { teamId, eventId } = c.req.valid('param');
  const { preeliminaryStatus, finalStatus } = c.req.valid('json');
  try {
    await updateEventTeamStatus(
      db,
      teamId,
      eventId,
      preeliminaryStatus,
      finalStatus,
    );

    return c.json(
      {
        message: 'Team event status updated successfully',
      },
      200,
    );
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          message: error.message,
        },
        400,
      );
    }

    return c.json(
      {
        message: 'error occured',
      },
      500,
    );
  }
});

adminEventProtectedRouter.openapi(
  putAdminEventTeamSubmissionVerdictRoute,
  async (c) => {
    const { eventId, teamId, typeId } = c.req.valid('param');
    const { judgeResponse } = c.req.valid('json');
    const team = await getEventTeamById(db, teamId, {
      event: true,
      submission: true,
    });
    if (!team || team.event.id !== eventId)
      return c.json({ error: "Team doesn't exist!" }, 400);

    if (!team.submission.find((s) => s.typeId === typeId))
      return c.json({ error: "Submission doesn't exist!" }, 400);

    const updatedSubmission = await updateEventSubmissionFeedback(
      db,
      teamId,
      typeId,
      judgeResponse,
    );

    return c.json(updatedSubmission, 200);
  },
);
