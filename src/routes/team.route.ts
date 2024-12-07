import { createRoute } from '@hono/zod-openapi';
import { PostTeamBodySchema, TeamSchema } from '../types/team.type';
import { createErrorResponse } from '../utils/error-response-factory';

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
	method: 'post',
	path: '/team',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PostTeamBodySchema,
        }
      },
      required: true,
    }
  },	
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TeamSchema
        },
      },
      description:'Successfully created a team', 
    },
    400: createErrorResponse("UNION","Bad Request Error"),
    500: createErrorResponse("GENERIC","Internal Server Error"),
  },
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
