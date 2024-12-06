import { createRoute } from '@hono/zod-openapi';
import { TeamIdParam, TeamSchema } from '~/types/team.type';
import { PostTeamDocumentBodySchema } from '~/types/team.type';
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
	responses: {},
});

export const getTeamByIdRoute = createRoute({
	operationId: 'getTeamById',
	tags: ['team'],
	method: 'get',
	path: '/team/{teamId}',
	responses: {},
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
	request: {
		params: TeamIdParam,
		body: {
			content: {
				'application/json': {
					schema: PostTeamDocumentBodySchema,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: TeamSchema,
				},
			},
			description: 'Succesfully updated team document upload',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
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
