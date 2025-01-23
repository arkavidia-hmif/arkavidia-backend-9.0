import { createRoute } from '@hono/zod-openapi';
import {
  CompetitionStatisticSchema,
  UserStatisticSchema,
} from '~/types/analytics.type';

import { createErrorResponse } from '../utils/error-response-factory';

export const getUserStatisticRoute = createRoute({
  operationId: 'getUserStatistic',
  tags: ['analytics'],
  method: 'get',
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
