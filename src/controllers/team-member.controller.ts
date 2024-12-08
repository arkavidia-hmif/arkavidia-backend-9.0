import { db } from '~/db/drizzle';
import {
	getTeamMemberById,
	updateTeamMemberDocument,
	updateTeamMemberVerification,
} from '~/repositories/team-member.repository';
import { getTeamById } from '~/repositories/team.repository';
import {
	getTeamMemberRoute,
	postTeamMemberDocumentRoute,
	postTeamMemberVerificationRoute,
} from '~/routes/team-member.route';
import { createAuthRouter } from '~/utils/router-factory';

export const teamMemberProtectedRouter = createAuthRouter();

teamMemberProtectedRouter.openapi(getTeamMemberRoute, async (c) => {
	return c.json(
		await getTeamMemberById(db, c.req.valid('param').teamId, c.var.user.id, {
			nisn: true,
			user: true,
			poster: true,
			twibbon: true,
			kartu: true,
		}),
		200,
	);
});

teamMemberProtectedRouter.openapi(postTeamMemberDocumentRoute, async (c) => {
	const { teamId } = c.req.valid('param');

	// Check if team exists
	const team = await getTeamById(db, teamId, { teamMember: true });
	if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

	// Check if user is in team
	const user = c.var.user;
	const teamMember = team.teamMembers.find((el) => el.userId === user.id);
	console.log(team);
	console.log(user.id, teamMember);
	console.log(user);
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

teamMemberProtectedRouter.openapi(postTeamMemberVerificationRoute, async (c) => {
	const { competitionId, teamId, userId } = c.req.valid("param");

  const team = await getTeamById(db, teamId, { competition: true, teamMember: true });
  if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

  if (team.competition.id !== competitionId)
    return c.json({ error: "Team and competition don't match!" }, 400);

	if (!team.teamMembers.find((el) => el.userId === userId))
		return c.json({ error: "User isn't inside team!" }, 403);

  const body = c.req.valid("json");

	await updateTeamMemberVerification(db, teamId, userId, body);

  return c.json({ message: "Successfully updated document verification!" }, 200);
});
