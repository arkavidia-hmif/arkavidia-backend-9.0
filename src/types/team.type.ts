import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { team } from '~/db/schema';
import { TeamMemberSchema } from './team-member.type';
import { CompetitionSchema } from './competition.type';

export const TeamIdParam = z.object({ teamId: z.string() });

export const TeamSchema = createSelectSchema(team, {
	createdAt: z.union([z.string(), z.date()]),
})
	.extend({
		teamMembers: z.array(TeamMemberSchema).optional(),
		competition: CompetitionSchema.optional(),
	})
	.openapi('Team');

export const ListUserTeamSchema = z.array(TeamSchema);