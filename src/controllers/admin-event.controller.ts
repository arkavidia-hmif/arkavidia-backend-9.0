import { db } from '~/db/drizzle';
import { transformRoleToName } from '~/middlewares/role-access.middleware';
import { getAllEventTeamsPaginated } from '~/repositories/event-team.repository';
import { getEvent, getEventByTitle } from '~/repositories/event.repository';
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
    return c.json({}, 200);
  },
);
