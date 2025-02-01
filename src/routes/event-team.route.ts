import { createRoute } from '@hono/zod-openapi';
import { isInTeamMiddleware } from '~/middlewares/is-in-team.middleware';
import {
  EventTeamNameBodySchema,
  EventTeamSchema,
  ListEventTeamSchema,
  TeamIdParamSchema,
} from '~/types/event-team.type';
import { EventIdParam } from '~/types/event.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const postCreateEventTeamSoloRoute = createRoute({
  operationId: 'postCreateEventTeamSolo',
  tags: ['event-team'],
  method: 'post',
  path: '/event/{eventId}/team/solo',
  request: {
    params: EventIdParam,
  },
  responses: {
    201: {
      description: 'Successfully created event team',
      content: {
        'application/json': {
          schema: EventTeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const postCreateEventTeamRoute = createRoute({
  operationId: 'postCreateEventTeam',
  tags: ['event-team'],
  method: 'post',
  path: '/event/{eventId}/team',
  request: {
    params: EventIdParam,
    body: {
      content: {
        'application/json': {
          schema: EventTeamNameBodySchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Successfully created event team',
      content: {
        'application/json': {
          schema: EventTeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getEventTeamRoute = createRoute({
  operationId: 'getEventTeam',
  tags: ['event-team'],
  method: 'get',
  path: '/event/team',
  responses: {
    200: {
      description: 'Successfully fetched event team',
      content: {
        'application/json': {
          schema: ListEventTeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getEventTeamByTeamIdRoute = createRoute({
  operationId: 'getEventTeamByTeamId',
  tags: ['event-team'],
  method: 'get',
  path: '/event/team/{teamId}',
  middleware: [isInTeamMiddleware()],
  request: {
    params: TeamIdParamSchema,
  },
  responses: {
    200: {
      description: 'Successfully fetched event team',
      content: {
        'application/json': {
          schema: EventTeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

// TODO: Implement putEventTeamRoute -> PUT /event/team/{teamId}
// containing request body of PutEventTeamBodySchema
