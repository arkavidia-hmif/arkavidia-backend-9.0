import { createRoute } from '@hono/zod-openapi';
import {
  EventIdParam,
  EventTimelineSchema,
  ListEventAnnouncementSchema,
  ListEventSchema,
  ListEventTimelineSchema,
} from '~/types/event.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getEventRoute = createRoute({
  operationId: 'getEvent',
  tags: ['event'],
  method: 'get',
  path: '/event',
  responses: {
    200: {
      description: 'Successfully fetched all event',
      content: {
        'application/json': {
          schema: ListEventSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getEventByIdRoute = createRoute({
  operationId: 'getEventById',
  tags: ['event'],
  method: 'get',
  path: '/event/{eventId}',
  request: {
    params: EventIdParam,
  },
  responses: {
    200: {
      description: 'Successfully fetched event by id',
      content: {
        'application/json': {
          schema: ListEventSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getEventTimelineRoute = createRoute({
  operationId: 'getEventTimeline',
  tags: ['event'],
  method: 'get',
  path: '/event/timeline',
  responses: {
    200: {
      description: 'Successfully fetched event timeline',
      content: {
        'application/json': {
          schema: ListEventTimelineSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getEventTimelineByIdRoute = createRoute({
  operationId: 'getEventTimelineById',
  tags: ['event'],
  method: 'get',
  path: '/event/timeline/{eventId}',
  request: {
    params: EventIdParam,
  },
  responses: {
    200: {
      description: 'Successfully fetched event timeline by id',
      content: {
        'application/json': {
          schema: EventTimelineSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getEventAnnouncementByIdRoute = createRoute({
  operationId: 'getEventAnnouncement',
  tags: ['event'],
  method: 'get',
  path: '/event/announcement/{eventId}',
  request: {
    params: EventIdParam,
  },
  responses: {
    200: {
      description: 'Successfully fetched event announcement',
      content: {
        'application/json': {
          schema: ListEventAnnouncementSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
