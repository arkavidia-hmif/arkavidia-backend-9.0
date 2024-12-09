import { db } from '~/db/drizzle';
import {
	getTeamById,
	insertUserToTeam,
	updateTeamVerification,
} from '~/repositories/team.repository';
import {
	postCreateTeamRoute,
	postTeamVerificationRoute,
} from '~/routes/team.route';
import { createAuthRouter } from '~/utils/router-factory';
import { createTeam } from '../repositories/team.repository';

export const teamProtectedRouter = createAuthRouter();

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
