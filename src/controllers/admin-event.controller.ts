import { db } from '~/db/drizzle';
import { transformRoleToName } from '~/middlewares/role-access.middleware';
import { getAllEventTeamsPaginated, getEventTeamById } from '~/repositories/event-team.repository';
import { getEvent, getEventByTitle, getEventSubmissionRequirement, updateEventSubmissionFeedback } from '~/repositories/event.repository';
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
    return c.json({}, 200);
  },
);

adminEventProtectedRouter.openapi(putAdminEventTeamStatusRoute, async (c) => {
  return c.json({}, 200);
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
