import { createRoute, z } from '@hono/zod-openapi';
import { isInEventTeamMiddleware } from '~/middlewares/is-in-team.middleware';
import {
  EventTeamMemberSchema,
  UpdateEventTeamMemberDocumentRouteSchema,
} from '~/types/event-team-member.type';
import {
  EventTeamAndUserIdParam,
  EventTeamIdParam,
} from '~/types/event-team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getEventTeamMembersRoute = createRoute({
  operationId: 'getEventTeamMembers',
  tags: ['event-team-member'],
  method: 'get',
  path: '/event-team/{teamId}/member',
  middleware: [isInEventTeamMiddleware()] as const,
  request: {
    params: EventTeamIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(EventTeamMemberSchema),
        },
      },
      description: 'Succesfully fetched all team member',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getEventTeamMemberByIdRoute = createRoute({
  operationId: 'getEventTeamMemberById',
  tags: ['event-team-member'],
  method: 'get',
  path: '/event-team/{teamId}/member/{userId}',
  middleware: [isInEventTeamMiddleware()] as const,

  request: {
    params: EventTeamAndUserIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: EventTeamMemberSchema,
        },
      },
      description: 'Succesfully fetched team member',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const updateEventTeamMemberDocumentRoute = createRoute({
  operationId: 'updateEventTeamMemberDocument',
  tags: ['event-team-member'],
  method: 'put',
  path: '/event-team/{teamId}/member/{userId}/document',
  middleware: [isInEventTeamMiddleware()] as const,

  request: {
    params: EventTeamAndUserIdParam,
    body: {
      content: {
        'application/json': {
          schema: UpdateEventTeamMemberDocumentRouteSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: EventTeamMemberSchema,
        },
      },
      description: 'Succesfully updated document upload',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
