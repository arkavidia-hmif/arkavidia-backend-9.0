import { db } from '~/db/drizzle';
import { updateTeamMemberDocument } from '~/repositories/team-member.repository';
import { getTeamById } from '~/repositories/team.repository';
import { postTeamMemberDocumentRoute } from '~/routes/team-member.route';
import { createAuthRouter } from '~/utils/router-factory';

export const teamMemberProtectedRouter = createAuthRouter();

teamMemberProtectedRouter.openapi(postTeamMemberDocumentRoute, async (c) => {
	const { teamId } = c.req.valid('param');

	// Check if team exists
	const team = await getTeamById(db, teamId, { teamMember: true });
	if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

	// Check if user is in team
	const user = c.var.user;
	const teamMember = team.teamMembers.find((el) => el.userId === user.id);
	if (!teamMember) return c.json({ error: "User isn't inside team!" }, 403);

	// Check if user member hasn't been verified yet
	if (teamMember.isVerified)
		return c.json({ error: 'You are already verified!' }, 403);

	const updatedTeamMember = await updateTeamMemberDocument(
		db,
		teamId,
		user.id,
		c.req.valid('json'),
	);

	return c.json(updatedTeamMember, 200);
});
