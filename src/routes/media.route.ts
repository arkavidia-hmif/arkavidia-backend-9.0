import { createRoute, z } from '@hono/zod-openapi';
import { createErrorResponse } from '../utils/error-response-factory';
import {
	GetPresignedLinkQuerySchema,
	PresignedUrlSchema,
} from '~/types/media.type';

export const getPresignedLink = createRoute({
	operationId: 'getPresignedLink',
	tags: ['media'],
	method: 'get',
	path: '/media/upload',
	request: {
		query: GetPresignedLinkQuerySchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: PresignedUrlSchema,
				},
			},
			description: 'Get presign URL to upload file',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});
