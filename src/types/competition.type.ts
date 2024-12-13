import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { TeamSchema } from './team.type';

export const CompetitionIdParam = z.object({ competitionId: z.string() });

export const CompetitionParticipantSchema = z
	.object({
        pagination: z.object({
            currentPage: z.number(),
            totalItems: z.number(),
            totalPages: z.number(),
            next: z.string().url().nullable(),
            prev: z.string().url().nullable(),
        }),
        result: z.array(TeamSchema),
	})
	.openapi('CompetitionParticipant');

export const GetCompetitionTimeQuerySchema = z.object({
    page: z.string().default("1").openapi({
        param: {
            in: 'query',
            required: false,
        },
    }),
    limit: z.string().default("10").openapi({
        param: {
            in: 'query',
            required: false,
        },
    }),
})