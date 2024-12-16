import { roleMiddleware } from '~/middlewares/role-access.middleware';
import { getCompetitionSubmissionById } from '~/repositories/competition.repository';
import { getCompetitionSubmissionRoute } from '~/routes/competition.route';
import { createAuthRouter } from '~/utils/router-factory';
import { db } from '~/db/drizzle';
export const competitionProtectedRouter = createAuthRouter();

competitionProtectedRouter.get(
	getCompetitionSubmissionRoute.getRoutingPath(),
	roleMiddleware('admin'),
);

competitionProtectedRouter.openapi(getCompetitionSubmissionRoute, async (c) => {
	const { page, limit } = c.req.valid('query');
	const { competitionId } = c.req.valid('param');

	const competitionSubmission = await getCompetitionSubmissionById(
		db,
		competitionId,
		{ page: Number(page), limit: Number(limit) },
	);

	return c.json(competitionSubmission, 200);
});
