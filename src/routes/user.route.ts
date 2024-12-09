import { createRoute } from '@hono/zod-openapi';
import {
	UpdateUserBodyRoute,
	UserSchema,
	UserUpdateSchema,
} from '~/types/user.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getUserRoute = createRoute({
	operationId: 'getUser',
	tags: ['user'],
	method: 'get',
	path: '/user',
	responses: {
		200: {
			description: 'Fetched currently logged in user.',
			content: {
				'application/json': {
					schema: UserSchema,
				},
			},
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const updateUserRoute = createRoute({
	operationId: 'updateUser',
	tags: ['user'],
	method: 'put',
	path: '/user',
	request: {
		body: {
			content: {
				'application/json': {
					schema: UpdateUserBodyRoute,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Updates currenly logged in user profile.',
			content: {
				'application/json': {
					schema: UserSchema,
				},
			},
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});
