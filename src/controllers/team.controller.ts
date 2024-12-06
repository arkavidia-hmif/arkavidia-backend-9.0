import { db } from "~/db/drizzle";
import { updateTeamDocument } from "~/repositories/team.repository";
import { getTeamById } from "~/repositories/team.repository";
import { postTeamDocumentRoute } from "~/routes/team.route";
import { createAuthRouter } from "~/utils/router-factory";

export const teamProtectedRouter = createAuthRouter();

teamProtectedRouter.openapi(postTeamDocumentRoute, async (c) => {
  const { teamId } = c.req.valid("param");

  // Check if team exists
  const team = await getTeamById(db, teamId, { teamMember: true });
  if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

  // Check if user is in team
  const user = c.var.user;
  const teamMember = team.teamMembers.find((el) => el.userId === user.id);
  if (!teamMember) return c.json({ error: "User isn't inside team!" }, 403);

  // Check if payment proof hasn't been verified yet
  if (team.isVerified) {
    return c.json({ error: "Your team already verified!" }, 400);
  }

  // Check if paymentProofId exist
  const { paymentProofMediaId } = c.req.valid("json");
  if (!paymentProofMediaId)
    return c.json({ error: "paymentProofMediaId id is required!" }, 400);

  const updatedTeam = await updateTeamDocument(
    db,
    teamId,
    user.id,
    c.req.valid("json")
  );

  return c.json(updatedTeam, 200);
});
