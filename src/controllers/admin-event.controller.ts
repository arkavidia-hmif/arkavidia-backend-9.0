import { db } from '~/db/drizzle';
import { getEventTeamById } from '~/repositories/event-team.repository';
import { updateEventSubmissionFeedback } from '~/repositories/event.repository';
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
  return c.json({}, 200);
});

adminEventProtectedRouter.openapi(getAdminAllEventTeamsRoute, async (c) => {
  return c.json({}, 200);
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
    return c.json({}, 200);
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
