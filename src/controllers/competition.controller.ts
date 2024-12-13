import { db } from "~/db/drizzle";
import { getCompetitionById, getCompetitionParticipant } from "~/repositories/competition.repository";
import { getCompetitionParticipantRoute } from "~/routes/competition.route";
import { createAuthRouter } from "~/utils/router-factory";
import { roleMiddleware } from "~/middlewares/role-access.middleware";

export const competitionProtectedRouter = createAuthRouter();

competitionProtectedRouter.get(
	getCompetitionParticipantRoute.getRoutingPath(),
	roleMiddleware('admin'),
);

competitionProtectedRouter.openapi(
  getCompetitionParticipantRoute,
  async (c) => {
    const { page, limit } = c.req.valid("query");
    const { competitionId } = c.req.valid("param");

    const competitionParticipant = await getCompetitionParticipant(
      db,
      competitionId,
      { page: Number(page), limit: Number(limit) }
    );
    return c.json(competitionParticipant, 200);
  }
);
