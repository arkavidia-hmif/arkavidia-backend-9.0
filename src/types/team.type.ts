import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { team } from '~/db/schema';

export const TeamSchema = createSelectSchema(team, {
    createdAt: z.union([z.string(), z.date()]),
}).openapi('Team');

export const TeamIdParam = z.object({ teamId: z.string() });

export const TeamMemberIdSchema = z.object({ userId: z.string() });

export const putChangeTeamNameBodySchema = z.object({ name: z.string() });