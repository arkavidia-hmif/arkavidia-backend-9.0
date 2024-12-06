import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { team } from '~/db/schema';
import { first } from '~/db/helper';
import type { TeamMemberRelationOption } from './team-member.repository';
import { PostTeamDocumentBodySchema } from '~/types/team.type';
import { insertMediaFromUrl } from './media.repository';


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

export const updateTeamDocument = async (
	db: Database,
	teamId: string,
	userId: string,
	data: z.infer<typeof PostTeamDocumentBodySchema>
) => {
	const insert = {
		paymentProofMediaId: data.paymentProofMediaId
			? (await insertMediaFromUrl(db, userId, data.paymentProofMediaId))[0].id
			: undefined,
	};

	return await db
		.update(team)
		.set(insert)
		.where(eq(team.id, teamId))
		.returning()
		.then(first);
};