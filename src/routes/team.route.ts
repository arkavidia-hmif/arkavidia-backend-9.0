import { createRoute } from '@hono/zod-openapi';
import { TeamMemberSchema } from '~/types/team-member.type';
import {
	CompetitionAndTeamIdParam,
	PostTeamBodySchema,
	PostTeamDocumentBodySchema,
	PostTeamVerificationBodySchema,
	TeamIdParam,
	TeamMemberIdSchema,
	TeamSchema,
	putChangeTeamNameBodySchema,
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
			description: 'Successfully created a team',
		},
		400: createErrorResponse('UNION', 'Bad Request Error'),
		500: createErrorResponse('GENERIC', 'Internal Server Error'),
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
	method: 'put', // change method to put: method (post) and path intersect with other feature (team member document submit)
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
	request: {
		params: TeamIdParam,
		body: {
			content: {
				'application/json': {
					schema: putChangeTeamNameBodySchema,
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
			description: 'Succesfully updated team name',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const deleteTeamMemberRoute = createRoute({
	operationId: 'deleteTeamMember',
	tags: ['team'],
	method: 'delete',
	path: '/team/{teamId}',
	request: {
		params: TeamIdParam,
		body: {
			content: {
				'application/json': {
					schema: TeamMemberIdSchema,
				},
			},
			required: true,
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: TeamMemberSchema,
				},
			},
			description: 'Succesfully deleted team member',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});

export const postTeamVerificationRoute = createRoute({
	operationId: 'postTeamVerification',
	tags: ['team', 'admin'],
	method: 'post',
	path: '/admin/{competitionId}/team/{teamId}',
	request: {
		params: CompetitionAndTeamIdParam,
		body: {
			content: {
				'application/json': {
					schema: PostTeamVerificationBodySchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: 'Succesfully updated team verification',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});
