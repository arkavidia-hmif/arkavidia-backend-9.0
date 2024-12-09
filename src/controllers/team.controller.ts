import { db } from "../db/drizzle";
import { insertUserToTeam } from "../repositories/team-member.repository";
import { createTeam } from "../repositories/team.repository";
import { postCreateTeamRoute } from "../routes/team.route";
import { createAuthRouter } from "~/utils/router-factory";

export const teamProtectedRouter = createAuthRouter();

teamProtectedRouter.openapi(postCreateTeamRoute, async (c) => {
  try {
    const { competitionId, name } = await c.req.json();
    const team = await createTeam(db, competitionId, name);
    const userId = c.var.user.id;
    await insertUserToTeam(db, team.id, userId);
    return c.json(team, 200);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500,
      );
    }

    return c.json(
      {
        error: "Unexpected error occured",
      },
      500,
    );
  }
});
