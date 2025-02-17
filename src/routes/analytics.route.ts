import { createRoute } from '@hono/zod-openapi';
import { roleMiddleware } from '~/middlewares/role-access.middleware';
import {
  AcademyaStatisticSchema,
  CompetitionStatisticSchema,
  EventSubmissionStatistic,
  UserStatisticSchema,
} from '~/types/analytics.type';

import { createErrorResponse } from '../utils/error-response-factory';

export const getUserStatisticRoute = createRoute({
  operationId: 'getUserStatistic',
  tags: ['analytics'],
  method: 'get',
  middleware: [roleMiddleware('admin')] as const,
  path: '/analytics/user',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserStatisticSchema,
        },
      },
      description: 'Get user statistics',
    },
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionStatisticRoute = createRoute({
  operationId: 'getCompetitionStatistic',
  tags: ['analytics'],
  method: 'get',
  middleware: [roleMiddleware('admin')] as const,
  path: '/analytics/competition',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CompetitionStatisticSchema,
        },
      },
      description: 'Get competition statistics',
    },
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getAcademyaStatisticRoute = createRoute({
  operationId: 'getAcademyaStatistic',
  tags: ['analytics'],
  method: 'get',
  middleware: [roleMiddleware('admin')] as const,
  path: '/analytics/academya',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AcademyaStatisticSchema,
        },
      },
      description: 'Get academya statistics',
    },
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getEventSubmissionStatisticRoute = createRoute({
  operationId: 'getEventSubmissionStatistic',
  description: 'Gets event submission statistic.',
  tags: ['analytics'],
  method: 'get',
  middleware: [roleMiddleware('admin')] as const,
  path: '/analytics/event/submission',
  responses: {
    200: {
      description: 'Succesfully fetch event submission statistic',
      content: {
        'application/json': {
          schema: EventSubmissionStatistic,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
