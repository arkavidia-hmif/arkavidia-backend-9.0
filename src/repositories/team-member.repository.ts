import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { teamMember } from '~/db/schema';
import type { PostTeamMemberDocumentBodySchema } from '~/types/team-member.type';
import { insertMediaFromUrl } from './media.repository';

export interface TeamMemberRelationOption {
	user?: boolean;
	nisn?: boolean;
	kartu?: boolean;
	poster?: boolean;
	twibbon?: boolean;
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
	// create media
	const insert = {
		nisnMediaId: data.nisnMediaId
			? (await insertMediaFromUrl(db, userId, data.nisnMediaId))[0].id
			: undefined,
		kartuMediaId: data.kartuMediaId
			? (await insertMediaFromUrl(db, userId, data.kartuMediaId))[0].id
			: undefined,
		twibbonMediaId: data.twibbonMediaId
			? (await insertMediaFromUrl(db, userId, data.twibbonMediaId))[0].id
			: undefined,
		posterMediaId: data.posterMediaId
			? (await insertMediaFromUrl(db, userId, data.posterMediaId))[0].id
			: undefined,
	};

	return await db
		.update(teamMember)
		.set(insert)
		.where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
		.returning()
		.then(first);
};

export const insertUserToTeam = async(
  db:Database,
  teamId:string,
  userId:string
)=>{
  return await db.transaction(async(tx)=>{
    const [insertedMember] = await tx.insert(teamMember)
      .values({
        teamId,
        userId,
        role:'leader'
      }).returning();
    
    return insertedMember;
  })
}
