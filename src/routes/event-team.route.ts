import { createRoute } from '@hono/zod-openapi';
// import { isInEventTeamMiddleware } from '~/middlewares/is-in-team.middleware';
import {
  CreateEventTeamBodySchema,
  CreateEventTeamWithNameBodySchema,
  EventTeamIdParam,
  EventTeamMemberIdSchema,
  EventTeamSchema,
  ListEventTeamSchema,
  PutChangeEventTeamNameBodySchema,
  PutEventTeamDocumentBodySchema,
} from '~/types/event-team.type';
import { EventIdParam } from '~/types/event.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getEventTeamRoute = createRoute({
  operationId: 'getEventTeam',
  tags: ['event-team'],
  method: 'get',
  path: '/event-team',
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
  path: '/event-team/{teamId}',
  // middleware: [isInEventTeamMiddleware()],
  request: {
    params: EventTeamIdParam,
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

export const postCreateEventTeamSoloRoute = createRoute({
  operationId: 'postCreateEventTeamSolo',
  tags: ['event-team'],
  method: 'post',
  path: '/event-team/solo',
  request: {
    params: EventIdParam,
    body: {
      content: {
        'application/json': {
          schema: CreateEventTeamBodySchema,
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

export const postCreateEventTeamRoute = createRoute({
  operationId: 'postCreateEventTeam',
  tags: ['event-team'],
  method: 'post',
  path: '/event-team/team',
  request: {
    params: EventIdParam,
    body: {
      content: {
        'application/json': {
          schema: CreateEventTeamWithNameBodySchema,
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

export const putChangeEventTeamNameRoute = createRoute({
  operationId: 'putChangeEventTeamName',
  tags: ['event-team'],
  method: 'put',
  path: '/event-team/{teamId}',
  request: {
    params: EventTeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PutChangeEventTeamNameBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successfully changed team name',
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

export const deleteEventTeamMemberRoute = createRoute({
  operationId: 'deleteEventTeamMember',
  tags: ['event-team'],
  method: 'delete',
  path: '/event-team/{teamId}',
  request: {
    params: EventTeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: EventTeamMemberIdSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successfully deleted team member',
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

export const postQuitEventTeamRoute = createRoute({
  operationId: 'postQuitEventTeam',
  tags: ['team'],
  method: 'post',
  path: '/event-team/{teamId}/quit',
  request: {
    params: EventTeamIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: EventTeamSchema,
        },
      },
      description: 'Succesfully quit team',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const putTeamDocumentRoute = createRoute({
  operationId: 'postTeamDocument',
  tags: ['team'],
  method: 'put',
  path: '/team/{teamId}/document',
  request: {
    params: EventTeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PutEventTeamDocumentBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: EventTeamSchema,
        },
      },
      description: 'Succesfully updated team document upload',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
