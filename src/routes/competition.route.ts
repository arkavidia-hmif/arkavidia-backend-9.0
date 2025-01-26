import { createRoute } from '@hono/zod-openapi';
import {
  AllAnnouncementSchema,
  AnnouncementSchema,
  CompetitionIdParam,
  CompetitionNameQuery,
  CompetitionParticipantSchema,
  CompetitionSchema,
  CompetitionTimelineSchema,
  GetCompetitionTimeQuerySchema,
  ListCompetitionSchema,
  PostCompAnnouncementBodySchema,
} from '~/types/competition.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getCompetitionByNameRoute = createRoute({
  operationId: 'getCompetitionByName',
  tags: ['competition'],
  method: 'get',
  path: '/competition/',
  request: {
    query: CompetitionNameQuery,
  },
  responses: {
    200: {
      description: 'Successfully fetched competition id',
      content: {
        'application/json': {
          schema: ListCompetitionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionByIdRoute = createRoute({
  operationId: 'getCompetitionById',
  tags: ['competition'],
  method: 'get',
  path: '/competition/{competitionId}',
  request: {
    params: CompetitionIdParam,
  },
  responses: {
    200: {
      description: 'Successfully fetched competition name',
      content: {
        'application/json': {
          schema: CompetitionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionTimelineRoute = createRoute({
  operationId: 'getCompetitionTimeline',
  tags: ['competition'],
  method: 'get',
  path: '/competition/timeline',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CompetitionTimelineSchema,
        },
      },
      description: 'Successfully fetched competition timelines',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionTimeLineByCompetitionIdRoute = createRoute({
  operationId: 'getCompetitionTimelineWithCompetitionId',
  tags: ['competition'],
  method: 'get',
  path: '/competition/{competitionId}/timeline',
  request: {
    params: CompetitionIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CompetitionTimelineSchema,
        },
      },
      description: 'Successfully fetched competition timelines',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getAdminCompAnnouncementRoute = createRoute({
  operationId: 'getAdminCompAnnouncement',
  tags: ['admin', 'competition'],
  method: 'get',
  path: '/admin/{competitionId}/announcement',
  request: {
    params: CompetitionIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AllAnnouncementSchema,
        },
      },
      description: 'Succesfully fetched all announcements',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const postAdminCompAnnouncementRoute = createRoute({
  operationId: 'postAdminCompAnnouncement',
  tags: ['admin', 'competition'],
  method: 'post',
  path: '/admin/{competitionId}/announcement',
  request: {
    params: CompetitionIdParam,
    body: {
      content: {
        'application/json': {
          schema: PostCompAnnouncementBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AnnouncementSchema,
        },
      },
      description: 'Succesfully posted announcement',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionParticipantRoute = createRoute({
  operationId: 'getCompetitionParticipant',
  tags: ['team', 'admin', 'competition'],
  method: 'get',
  path: '/admin/{competitionId}/team',
  request: {
    params: CompetitionIdParam,
    query: GetCompetitionTimeQuerySchema,
  },
  responses: {
    200: {
      description: "Fetched competition's participant.",
      content: {
        'application/json': {
          schema: CompetitionParticipantSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
