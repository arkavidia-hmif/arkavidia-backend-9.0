import { db } from '~/db/drizzle';
import { roleMiddleware } from '~/middlewares/role-access.middleware';
import { getUserStatistics } from '~/repositories/analytics.repository';
import { getUserStatisticRoute } from '~/routes/analytics.route';
import { createAuthRouter } from '~/utils/router-factory';

export const analyticsProtectedRouter = createAuthRouter();

analyticsProtectedRouter.get(
  getUserStatisticRoute.getRoutingPath(),
  roleMiddleware('admin'),
);
analyticsProtectedRouter.openapi(getUserStatisticRoute, async (c) => {
  return c.json(
    {
      ...(await getUserStatistics(db)),
      education: {
        sma: await getUserStatistics(db, 'sma'),
        s1: await getUserStatistics(db, 's1'),
        s2: await getUserStatistics(db, 's2'),
      },
    },
    200,
  );
});
