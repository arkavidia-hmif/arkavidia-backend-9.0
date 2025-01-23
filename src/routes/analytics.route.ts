import { createRoute } from '@hono/zod-openapi';
import {
  OptionalServiceKeyParamSchema,
  UserStatisticSchema,
} from '~/types/analytics.type';

import { createErrorResponse } from '../utils/error-response-factory';

export const getUserStatisticRoute = createRoute({
  operationId: 'getUserStatistic',
  tags: ['analytics'],
  method: 'get',
  path: '/analytics/user',
  request: {
    params: OptionalServiceKeyParamSchema,
  },
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
