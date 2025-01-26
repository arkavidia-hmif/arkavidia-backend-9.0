import { db } from '~/db/drizzle';
import {
  getCompetition,
  getCompetitionIdByName,
  getCompetitionTimelines,
  getCompetitionTimelinesByCompetitionId,
} from '~/repositories/competition.repository';
import {
  getCompetitionByIdRoute,
  getCompetitionByNameRoute,
  getCompetitionTimeLineByCompetitionIdRoute,
  getCompetitionTimelineRoute,
} from '~/routes/competition.route';
import { createAuthRouter, createRouter } from '~/utils/router-factory';

export const competitionProtectedRouter = createAuthRouter();
export const competitionRouter = createRouter();

competitionRouter.openapi(getCompetitionByNameRoute, async (c) => {
  const { name } = c.req.valid('query');
  const competition = await getCompetitionIdByName(db, name);
  return c.json(competition, 200);
});

competitionProtectedRouter.openapi(getCompetitionByIdRoute, async (c) => {
  const { competitionId } = c.req.valid('param');
  const competition = await getCompetition(db, competitionId);
  return c.json(competition, 200);
});

competitionRouter.openapi(getCompetitionTimelineRoute, async (c) => {
  const user = c.get('user');
  const userId = user.id;
  const timelines = await getCompetitionTimelines(db, userId);
  return c.json(timelines, 200);
});

competitionRouter.openapi(
  getCompetitionTimeLineByCompetitionIdRoute,
  async (c) => {
    const { competitionId } = c.req.valid('param');
    const timelines = await getCompetitionTimelinesByCompetitionId(
      db,
      competitionId,
    );
    return c.json(timelines, 200);
  },
);
