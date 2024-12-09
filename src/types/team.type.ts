import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { team } from '~/db/schema';

export const TeamIdParam = z.object({ teamId: z.string() });

export const TeamSchema = createSelectSchema(team, {
	createdAt: z.union([z.string(), z.date()]),
}).openapi('Team');

export const ListUserTeamSchema = z.array(TeamSchema);
