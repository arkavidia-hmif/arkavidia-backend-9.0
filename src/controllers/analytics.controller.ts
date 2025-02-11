import { db } from '~/db/drizzle';
import {
  getAcademyaStatistics,
  getCompetitionStatistics,
  getUserStatistics,
} from '~/repositories/analytics.repository';
import {
  getAcademyaStatisticRoute,
  getCompetitionStatisticRoute,
  getUserStatisticRoute,
} from '~/routes/analytics.route';
import { createAuthRouter } from '~/utils/router-factory';

export const analyticsProtectedRouter = createAuthRouter();

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

analyticsProtectedRouter.openapi(getCompetitionStatisticRoute, async (c) => {
  return c.json({
    ...(await getCompetitionStatistics(db)),
    competition: {
      competitiveProgramming: await getCompetitionStatistics(db, 'CP'),
      captureTheFlag: await getCompetitionStatistics(db, 'CTF'),
      arkalogica: await getCompetitionStatistics(db, 'Arkalogica'),
      datavidia: await getCompetitionStatistics(db, 'Datavidia'),
      hackvidia: await getCompetitionStatistics(db, 'Hackvidia'),
      uxvidia: await getCompetitionStatistics(db, 'UXvidia'),
    },
  });
});

analyticsProtectedRouter.openapi(getAcademyaStatisticRoute, async (c) => {
  return c.json({
    ...(await getAcademyaStatistics(db)),
    Academya: {
      softwareEngineering: await getAcademyaStatistics(
        db,
        'Academya - Software Engineering',
      ),
      dataScience: await getAcademyaStatistics(db, 'Academya - Data Science'),
      uiux: await getAcademyaStatistics(db, 'Academya - UI UX'),
      productManagement: await getAcademyaStatistics(
        db,
        'Academya - Product Management',
      ),
    },
  });
});
