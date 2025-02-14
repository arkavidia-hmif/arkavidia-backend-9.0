import { db } from '~/db/drizzle';
import { getEventTeamById } from '~/repositories/event-team.repository';
import { getEventSubmissionRequirement } from '~/repositories/event.repository';
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
    return c.json({}, 200);
  },
);
