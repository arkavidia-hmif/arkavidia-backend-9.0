import { eq } from 'drizzle-orm';
import type { Database } from '~/db/drizzle';
import { team } from '~/db/schema';
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
