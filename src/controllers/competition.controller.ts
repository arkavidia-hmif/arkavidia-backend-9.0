import { db } from '~/db/drizzle';
import { createAuthRouter } from '~/utils/router-factory';
import { roleMiddleware } from '~/middlewares/role-access.middleware';
import {
  getAnnouncementsByCompetitionId,
  getCompetition,
  postAnnouncement,
} from '~/repositories/competition.repository';
import {
  getAdminCompAnnouncementRoute,
  postAdminCompAnnouncementRoute,
} from '~/routes/competition.route';

export const competitionProtectedRouter = createAuthRouter();

competitionProtectedRouter.get(
  getAdminCompAnnouncementRoute.getRoutingPath(),
  roleMiddleware('admin'),
);
competitionProtectedRouter.openapi(getAdminCompAnnouncementRoute, async (c) => {
  const { competitionId } = c.req.valid('param');

  // Check if competition exists
  const competition = await getCompetition(db, competitionId);
  if (!competition) return c.json({ error: "Competition doesn't exist!" }, 400);

  const announcements = await getAnnouncementsByCompetitionId(
    db,
    competitionId,
  );
  return c.json(announcements, 200);
});

competitionProtectedRouter.post(
  postAdminCompAnnouncementRoute.getRoutingPath(),
  roleMiddleware('admin'),
);
competitionProtectedRouter.openapi(
  postAdminCompAnnouncementRoute,
  async (c) => {
    const { competitionId } = c.req.valid('param');
    const body = c.req.valid('json');

    // Check if competition exists
    const competition = await getCompetition(db, competitionId);
    if (!competition)
      return c.json({ error: "Competition doesn't exist!" }, 400);

    // Create announcement
    const user = c.var.user;
    const announcement = await postAnnouncement(
      db,
      competitionId,
      user.id,
      body,
    );
    return c.json(announcement, 200);
  },
);
