import { createRoute, z } from '@hono/zod-openapi';
import { createErrorResponse } from '../utils/error-response-factory';

export const getHealthStatusRoute = createRoute({
	operationId: 'getHealthStatus',
	tags: ['health'],
	method: 'get',
	path: '/health',
	responses: {
		200: {
			content: {
				'application/json': {
					schema: z.object({
						message: z.string().default('API is running sucesfully!'),
					}),
				},
			},
			description: 'Check if server is healthy',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});
