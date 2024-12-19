import { createRoute } from '@hono/zod-openapi';
import {
  CompetitionAndTeamAndUserIdParam,
  PostTeamMemberDocumentBodySchema,
  PostTeamMemberVerificationBodySchema,
  TeamMemberSchema,
} from '~/types/team-member.type';
import { TeamIdParam } from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getTeamMemberRoute = createRoute({
  operationId: 'getTeamMember',
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
          schema: TeamMemberSchema,
        },
      },
      description: 'Succesfully fetched tean member',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const postTeamMemberDocumentRoute = createRoute({
  operationId: 'postTeamMemberDocument',
  tags: ['team-member'],
  method: 'post',
  path: '/team/{teamId}/upload',
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

export const postTeamMemberVerificationRoute = createRoute({
  operationId: 'postTeamMemberVerification',
  tags: ['team-member', 'admin'],
  method: 'post',
  path: '/admin/{competitionId}/team/{teamId}/{userId}',
  request: {
    params: CompetitionAndTeamAndUserIdParam,
    body: {
      content: {
        'application/json': {
          schema: PostTeamMemberVerificationBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Succesfully updated document verification',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
