import { createRoute } from '@hono/zod-openapi';
import {
    CompetitionIdParam,
    CompetitionParticipantSchema,
    GetCompetitionTimeQuerySchema
} from '~/types/competition.type';
import { createErrorResponse } from '~/utils/error-response-factory';


export const getCompetitionParticipantRoute = createRoute({
	operationId: 'getCompetitionParticipant',
	tags: ['team', 'admin', 'competition'],
	method: 'get',
	path: '/admin/{competitionId}/team',
	request: {
		params: CompetitionIdParam,
        query: GetCompetitionTimeQuerySchema,
	},
	responses: {
		200: {
			description: 'Fetched competition\'s participant.',
			content: {
				'application/json': {
					schema: CompetitionParticipantSchema,
				},
			},
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});