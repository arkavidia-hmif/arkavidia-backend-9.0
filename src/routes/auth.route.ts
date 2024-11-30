import { createRoute, z } from '@hono/zod-openapi';
import {
	BasicRegisterBodySchema,
	BasicVerifyAccountQuerySchema,
} from '~/types/auth.type';
import { createErrorResponse } from '../utils/error-response-factory';

export const basicRegisterRoute = createRoute({
	operationId: 'basicRegister',
	tags: ['auth'],
	method: 'post',
	path: '/basic/register',
	request: {
		body: {
			content: {
				'application/json': {
					schema: BasicRegisterBodySchema,
				},
			},
			required: true,
		},
	},
	responses: {
		204: {
			description: 'Registration succesful. Verification token sent to email.',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const basicVerifyAccountRoute = createRoute({
	operationId: 'basicVerifyAccount',
	tags: ['auth'],
	method: 'post',
	path: '/verify',
	request: {
		query: BasicVerifyAccountQuerySchema,
	},
	responses: {
		204: {
			description: 'Verification succesful',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});
