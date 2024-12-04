import { createRoute } from '@hono/zod-openapi';
import {
	PostTeamMemberDocumentBodySchema,
	TeamMemberSchema,
} from '~/types/team-member.type';
import { TeamIdParam } from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const postTeamMemberDocumentRoute = createRoute({
	operationId: 'postTeamMemberDocument',
	tags: ['team-member'],
	method: 'post',
	path: '/team/{teamId}/upload/{userId}',
	request: {
		params: TeamIdParam,
		body: {
			content: {
				'application/json': {
					schema: PostTeamMemberDocumentBodySchema,
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
			description: 'Succesfully updated document upload',
		},
		400: createErrorResponse('UNION', 'Bad request error'),
		500: createErrorResponse('GENERIC', 'Internal server error'),
	},
});
