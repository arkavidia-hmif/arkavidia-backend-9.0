import { createRoute } from '@hono/zod-openapi';
import {
  AnnouncementSchema,
  PostCompAnnouncementBodySchema,
} from '~/types/competition.type';
import { AllAnnouncementSchema } from '~/types/competition.type';
import { CompetitionIdParam } from '~/types/competition.type';
import { createErrorResponse } from '~/utils/error-response-factory';

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
  path: '/api/admin/{competitionId}/announcement',
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
