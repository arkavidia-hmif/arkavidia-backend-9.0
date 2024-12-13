import { eq } from 'drizzle-orm';
import type { Database } from '~/db/drizzle';
import { team, teamMember, user, competition } from '~/db/schema';
import type { TeamMemberRelationOption } from './team-member.repository';

interface TeamRelationOption {
	teamMember?: TeamMemberRelationOption | boolean;
	competition?: boolean;
	paymentProof?: boolean;
}

export const getTeamById = async (
	db: Database,
	teamId: string,
	options?: TeamRelationOption,
) => {
	return await db.query.team.findFirst({
		where: eq(team.id, teamId),
		with: {
			teamMembers:
				typeof options?.teamMember === 'boolean'
					? options?.teamMember
						? true
						: undefined
					: {
							with: {
								user: options?.teamMember?.user ? true : undefined,
								nisn: options?.teamMember?.nisn ? true : undefined,
								kartu: options?.teamMember?.kartu ? true : undefined,
								poster: options?.teamMember?.poster ? true : undefined,
								twibbon: options?.teamMember?.twibbon ? true : undefined,
							},
						},
			competition: options?.competition ? true : undefined,
			paymentProof: options?.paymentProof ? true : undefined,
		},
	});
};

export const getUserTeams = async (db: Database, userId: string) => {
	const teams = await db
		.select({ team, competition })
		.from(team)
		.innerJoin(teamMember, eq(team.id, teamMember.teamId))
		.innerJoin(user, eq(teamMember.userId, user.id))
		.innerJoin(competition, eq(team.competitionId, competition.id))
		.where(eq(user.id, userId));

	return teams.map((item) => ({
		...item.team,
		competition: item.competition,
	}));
};
