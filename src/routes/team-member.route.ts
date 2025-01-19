import { createRoute, z } from '@hono/zod-openapi';
import {
  TeamAndUserIdParam,
  TeamMemberSchema,
  UpdateTeamMemberDocumentRouteSchema,
} from '~/types/team-member.type';
import { TeamIdParam } from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getTeamMembersRoute = createRoute({
  operationId: 'getTeamMembers',
  tags: ['team-member'],
  method: 'get',
  path: '/team/{teamId}/member',
  request: {
    params: TeamIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(TeamMemberSchema),
        },
      },
      description: 'Succesfully fetched all team member',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getTeamMemberByIdRoute = createRoute({
  operationId: 'getTeamMembers',
  tags: ['team-member'],
  method: 'get',
  path: '/team/{teamId}/member/{userId}',
  request: {
    params: TeamAndUserIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TeamMemberSchema,
        },
      },
      description: 'Succesfully fetched all team member',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const updateTeamMemberDocumentRoute = createRoute({
  operationId: 'updateTeamMemberDocument',
  tags: ['team-member'],
  method: 'put',
  path: '/team/{teamId}/member/{userId}/document',
  request: {
    params: TeamAndUserIdParam,
    body: {
      content: {
        'application/json': {
          schema: UpdateTeamMemberDocumentRouteSchema,
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
