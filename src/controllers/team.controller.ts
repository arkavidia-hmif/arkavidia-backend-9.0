import { db } from '~/db/drizzle';
import {
	getTeamMemberById,
	updateTeamMemberDocument,
  getTeamById,
	insertUserToTeam,
	updateTeamVerification,
} from '~/repositories/team-member.repository';
import { deleteTeamMember, getTeamById, putChangeTeamName } from '~/repositories/team.repository';
import {
  createTeam,
	getTeamMemberRoute,
	postTeamMemberDocumentRoute,
} from '~/routes/team-member.route';
import { deleteTeamMemberRoute, putChangeTeamNameRoute, postCreateTeamRoute,
	postTeamVerificationRoute } from '~/routes/team.route';
import { createAuthRouter } from '~/utils/router-factory';

export const teamProtectedRouter = createAuthRouter();

teamProtectedRouter.openapi(putChangeTeamNameRoute, async (c) => {
    const { teamId } = c.req.valid('param');

    // Check if team exists
    const team = await getTeamById(db, teamId, { teamMember: true });
    if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

    // Check if user is in team
    const user = c.var.user;
    const teamMember = team.teamMembers.find((el) => el.userId === user.id);
    if (!teamMember) return c.json({ error: "User isn't inside team!" }, 403);

    // check if user is the leader
    if (teamMember.role !== "leader") return c.json({ error: "You are not the leader of this team!" }, 403);

    const updatedTeam = await putChangeTeamName(db, teamId, c.req.valid('json'));
    return c.json(updatedTeam, 200);

})

teamProtectedRouter.openapi(deleteTeamMemberRoute, async (c) => {
    const { teamId } = c.req.valid('param');

    // Check if team exists
	const team = await getTeamById(db, teamId, { teamMember: true });
	if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

    // Check if user is in team
	const user = c.var.user;
	const teamMember = team.teamMembers.find((el) => el.userId === user.id);
	if (!teamMember) return c.json({ error: "User isn't inside team!" }, 403);

    // check if user is the leader
    if (teamMember.role !== "leader") return c.json({ error: "You are not the leader of this team!" }, 403);

    // check if the deleted team member is in the same team
    const deletedTeamMemberId = c.req.valid('json').userId;
    const deletedTeamMember = team.teamMembers.find((el) => el.userId === deletedTeamMemberId);
    if (!deletedTeamMember) return c.json({ error: "Team member doesn't exist!" }, 403);

    const member = await deleteTeamMember(db, c.req.valid('json'));;

    return c.json(member, 200);
    
})

teamProtectedRouter.openapi(postTeamVerificationRoute, async (c) => {
	const { competitionId, teamId } = c.req.valid('param');

	const team = await getTeamById(db, teamId, { competition: true });
	if (!team) return c.json({ error: "Team doesn't exist!" }, 400);

	if (team.competition.id !== competitionId)
		return c.json({ error: "Team and competition don't match!" }, 400);

	const body = c.req.valid('json');

	await updateTeamVerification(db, teamId, body);

	return c.json({ message: 'Successfully updated team verification!' }, 200);
});

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
				error: 'Unexpected error occured',
			},
			500,
		);
	}
});
