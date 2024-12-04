import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { teamMember } from '~/db/schema';
import type { PostTeamMemberDocumentBodySchema } from '~/types/team-member.type';

export interface TeamMemberRelationOption {
	user: boolean;
	nisn: boolean;
	kartu: boolean;
	poster: boolean;
	twibbon: boolean;
}

export const getTeamMemberById = async (
	db: Database,
	teamId: string,
	userId: string,
	options?: TeamMemberRelationOption,
) => {
	return await db.query.teamMember.findFirst({
		where: and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)),
		with: {
			user: options?.user ? true : undefined,
			nisn: options?.nisn ? true : undefined,
			kartu: options?.kartu ? true : undefined,
			poster: options?.poster ? true : undefined,
			twibbon: options?.twibbon ? true : undefined,
		},
	});
};

export const updateTeamMemberDocument = async (
	db: Database,
	teamId: string,
	userId: string,
	data: z.infer<typeof PostTeamMemberDocumentBodySchema>,
) => {
	return await db
		.update(teamMember)
		.set(data)
		.where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
		.returning()
		.then(first);
};
