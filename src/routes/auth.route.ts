import { createRoute, z } from '@hono/zod-openapi';
import {
	AccessRefreshTokenSchema,
	BasicLoginBodySchema,
	BasicRegisterBodySchema,
	BasicVerifyAccountQuerySchema,
} from '~/types/auth.type';
import { createErrorResponse } from '../utils/error-response-factory';

export const basicRegisterRoute = createRoute({
	operationId: 'basicRegister',
	tags: ['auth'],
	method: 'post',
	path: '/auth/basic/register',
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
	path: '/auth/verify',
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

export const basicLoginRoute = createRoute({
	operationId: 'basicLogin',
	tags: ['auth'],
	method: 'post',
	path: '/auth/basic/login',
	request: {
		body: {
			content: {
				'application/json': {
					schema: BasicLoginBodySchema,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			description: 'Login succesful',
			content: {
				'application/json': {
					schema: AccessRefreshTokenSchema,
				},
			},
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const logoutRoute = createRoute({
	operationId: 'logout',
	tags: ['auth'],
	method: 'post',
	path: '/auth/logout',
	responses: {
		204: {
			description: 'Logout sucessful',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

// refreshTokenRoute
