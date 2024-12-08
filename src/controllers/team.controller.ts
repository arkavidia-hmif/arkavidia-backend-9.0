import { db } from "~/db/drizzle";
import { getTeamById, updateTeamVerification } from "~/repositories/team.repository";
import { postTeamVerificationRoute } from "~/routes/team.route";
import { createAuthRouter } from "~/utils/router-factory";

export const teamProtectedRouter = createAuthRouter();

teamProtectedRouter.openapi(postTeamVerificationRoute, async (c) => {
  const { competitionId, teamId } = c.req.valid("param");

  const team = await getTeamById(db, teamId, { competition: true });
  if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

  if (team.competition.id !== competitionId)
    return c.json({ error: "Team and competition don't match!" }, 400);

  const body = c.req.valid("json");

  await updateTeamVerification(db, teamId, body);

  return c.json({ message: "Successfully updated team verification!" }, 200);
});