import { createRoute } from '@hono/zod-openapi';
import {
	CompetitionIdParam,
	CompetitionSubmissionSchema,
	GetCompetitionSubmissionQuerySchema,
} from '~/types/competition.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getCompetitionSubmissionRoute = createRoute({
	operationId: 'getCompetitionSubmission',
	tags: ['admin', 'competition'],
	method: 'get',
	path: '/admin/{competitionId}/submission',
	request: {
		params: CompetitionIdParam,
		query: GetCompetitionSubmissionQuerySchema,
	},
	responses: {
		200: {
			description: "Fetched competition's submission.",
			content: {
				'application/json': {
					schema: CompetitionSubmissionSchema,
				},
			},
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});
