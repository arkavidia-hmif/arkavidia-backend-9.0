import { db } from '~/db/drizzle';
import {
	getTeamMemberById,
	updateTeamMemberDocument,
} from '~/repositories/team-member.repository';
import { deleteTeamMember, getTeamById, putChangeTeamName } from '~/repositories/team.repository';
import {
	getTeamMemberRoute,
	postTeamMemberDocumentRoute,
} from '~/routes/team-member.route';
import { deleteTeamMemberRoute, putChangeTeamNameRoute } from '~/routes/team.route';
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

    const deletedTeamMember = await deleteTeamMember(db, c.req.valid('json'));;

    return c.json(deletedTeamMember, 200);
    
})

