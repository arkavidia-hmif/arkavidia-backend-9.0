import { createRoute } from '@hono/zod-openapi';
import { team } from '~/db/schema';
import {
	ListUserTeamSchema,
	TeamSchema,
	TeamIdParam,
} from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const joinTeamByCodeRoute = createRoute({
	operationId: 'joinTeamByCode',
	tags: ['team'],
	method: 'get',
	path: '/team/join',
	responses: {},
});

export const getTeamsRoute = createRoute({
	operationId: 'getTeams',
	tags: ['team'],
	method: 'get',
	path: '/team',
	responses: {
		200: {
			description: 'Get user teams',
			content: {
				'application/json': {
					schema: ListUserTeamSchema,
				},
			},
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const getTeamByIdRoute = createRoute({
	operationId: 'getTeamById',
	tags: ['team'],
	method: 'get',
	path: '/team/{teamId}',
	request: {
		params: TeamIdParam,
	},
	responses: {
		200: {
			description: 'Get team by id',
			content: {
				'application/json': {
					schema: TeamSchema,
				},
			},
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const postCreateTeamRoute = createRoute({
	operationId: 'postCreateTeam',
	tags: ['team'],
	method: 'get',
	path: '/team',
	responses: {},
});

export const postQuitTeamRoute = createRoute({
	operationId: 'postQuitTeam',
	tags: ['team'],
	method: 'post',
	path: '/team/{teamId}/quit',
	responses: {},
});

export const postTeamDocumentRoute = createRoute({
	operationId: 'postTeamDocument',
	tags: ['team'],
	method: 'post',
	path: '/team/{teamId}/upload',
	responses: {},
});

export const putChangeTeamNameRoute = createRoute({
	operationId: 'putChangeTeamName',
	tags: ['team'],
	method: 'put',
	path: '/team/{teamId}',
	responses: {},
});

export const deleteTeamMemberRoute = createRoute({
	operationId: 'deleteTeamMember',
	tags: ['team'],
	method: 'delete',
	path: '/team/{teamId}',
	responses: {},
});
