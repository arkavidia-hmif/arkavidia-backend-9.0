import { z } from 'zod';
import { TeamSubmissionSchema } from '~/types/team.type';

export const CompetitionIdParam = z.object({ competitionId: z.string() });

export const GetCompetitionSubmissionQuerySchema = z.object({
	page: z
		.string()
		.default('1')
		.openapi({
			param: {
				in: 'query',
				required: false,
			},
		}),
	limit: z
		.string()
		.default('10')
		.openapi({
			param: {
				in: 'query',
				required: false,
			},
		}),
});

export const CompetitionSubmissionSchema = z
	.object({
		pagination: z.object({
			currentPage: z.number().min(1),
			totalItems: z.number().nonnegative(),
			totalPages: z.number().nonnegative(),
			next: z.string().url().nullable(),
			prev: z.string().url().nullable(),
		}),
		result: z.array(TeamSubmissionSchema).min(1),
	})
	.openapi('CompetitionSubmission');
