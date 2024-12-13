import { db } from '~/db/drizzle';
import { createAuthRouter} from '~/utils/router-factory';
import { getTeamByIdRoute, getTeamsRoute } from '~/routes/team.route';
import { getTeamById, getUserTeams } from '~/repositories/team.repository';
export const teamProtectedRouter = createAuthRouter();

teamProtectedRouter.openapi(getTeamByIdRoute, async (c) => {
	const { teamId } = c.req.valid('param');
	const team = await getTeamById(db, teamId, {
		teamMember: {
			user: true,
			nisn: true,
			kartu: true,
			poster: true,
			twibbon: true,
		},
		competition: true,
		paymentProof: false,
	});
	return c.json(team, 200);
});

teamProtectedRouter.openapi(getTeamsRoute, async (c) => {
	const user = c.var.user;
	const teams = await getUserTeams(db, user.id);
	return c.json(teams, 200);
});
