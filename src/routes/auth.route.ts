import { createRoute, z } from '@hono/zod-openapi';
import {
	AccessRefreshTokenSchema,
	AccessTokenSchema,
	BasicLoginBodySchema,
	BasicRegisterBodySchema,
	BasicVerifyAccountQuerySchema,
	GoogleCallbackQuerySchema,
	RefreshTokenQuerySchema,
	UserSchema,
} from '~/types/auth.type';
import { createErrorResponse } from '../utils/error-response-factory';

/** BASIC AUTHENTICATION ROUTES (Email & Password) */
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
		200: {
			description: 'Verification sucessful, automatic login',
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

/** GOOGLE AUTHENTICATION ROUTES */
export const googleAuthRoute = createRoute({
	operationId: 'googleAuth',
	tags: ['auth'],
	method: 'get',
	path: '/auth/google',
	responses: {
		302: {
			description: 'Redirect to Google login',
			headers: {
				location: {
					description: 'URL to Google consent screen',
					schema: {
						type: 'string',
					},
				},
			},
		},
	},
});

export const googleAuthCallbackRoute = createRoute({
	operationId: 'googleAuthCallback',
	tags: ['auth'],
	method: 'get',
	path: '/auth/google/callback',
	request: {
		query: GoogleCallbackQuerySchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: AccessRefreshTokenSchema,
				},
			},
			description: 'Login succesful',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

/** BOTH AUTH */
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
		401: createErrorResponse('UNION', 'Unauthorized'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const selfRoute = createRoute({
	operationId: 'self',
	tags: ['auth'],
	method: 'get',
	path: '/auth/self',
	responses: {
		200: {
			description: 'Get self',
			content: {
				'application/json': {
					schema: UserSchema,
				},
			},
		},
		401: createErrorResponse('GENERIC', 'Unauthorized'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const refreshRoute = createRoute({
	operationId: 'refresh',
	tags: ['auth'],
	method: 'get',
	path: '/auth/refresh',
	request: {
		query: RefreshTokenQuerySchema,
	},
	responses: {
		200: {
			description: 'Refresh access token,',
			content: {
				'application/json': {
					schema: AccessTokenSchema,
				},
			},
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});
