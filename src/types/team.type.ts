import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { team } from '../db/schema';

export const TeamIdParam = z.object({ teamId: z.string() });

export const CompetitionAndTeamIdParam = z.object({
  competitionId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
  teamId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const PostTeamVerificationBodySchema = z.object({
  isVerified: z.boolean(),
  verificationError: z.string().optional(),
});

export const PostTeamBodySchema = createInsertSchema(team).pick({
	competitionId: true,
	name: true,
});

export const TeamSchema = createSelectSchema(team);
