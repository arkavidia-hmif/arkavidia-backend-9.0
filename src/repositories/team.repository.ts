import { eq } from 'drizzle-orm';
import type { Database } from '~/db/drizzle';
import { team, teamMember } from '~/db/schema';
import type { TeamMemberRelationOption } from './team-member.repository';
import { putChangeTeamNameBodySchema, TeamMemberIdSchema } from '~/types/team.type';
import { z } from 'zod';
import { first } from '~/db/helper';

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

export const putChangeTeamName = async (
	db: Database,
	teamId: string,
	body: z.infer<typeof putChangeTeamNameBodySchema>
) => {
	return await db
		.update(team)
		.set({ name: body.name })
		.where(eq(team.id, teamId))
		.returning()
		.then(first);
}


export const deleteTeamMember = async (
	db: Database,
	body: z.infer<typeof TeamMemberIdSchema>
) => {
	return await db
		.delete(teamMember)
		.where(eq(teamMember.userId, body.userId))
		.returning()
		.then(first);
}