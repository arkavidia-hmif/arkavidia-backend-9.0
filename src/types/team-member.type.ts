import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { teamMember } from '~/db/schema/team-member.schema';
import { MediaSchema } from './media.type';
import { z } from 'zod';

export const TeamMemberSchema = createSelectSchema(teamMember)
	.merge(
		z.object({
			nisn: MediaSchema,
			kartu: MediaSchema,
			poster: MediaSchema,
			twibbon: MediaSchema,
		}),
	)
	.openapi('TeamMember');

export const PostTeamMemberDocumentBodySchema = createInsertSchema(
	teamMember,
).pick({
	nisnMediaId: true,
	kartuMediaId: true,
	posterMediaId: true,
	twibbonMediaId: true,
});
