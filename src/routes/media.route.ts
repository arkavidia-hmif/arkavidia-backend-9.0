import { createRoute } from '@hono/zod-openapi';
import {
  GetPresignedLinkQuerySchema,
  PresignedUrlSchema,
} from '~/types/media.type';

import { createErrorResponse } from '../utils/error-response-factory';

export const getUploadPresignedLink = createRoute({
  operationId: 'getPresignedLink',
  tags: ['media'],
  method: 'get',
  path: '/media/upload',
  request: {
    query: GetPresignedLinkQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PresignedUrlSchema,
        },
      },
      description: 'Get presign URL to upload file',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getDownloadPresignedLink = createRoute({
  operationId: 'getDownloadPresignedLink',
  tags: ['media'],
  method: 'get',
  path: '/media/download',
  request: {
    query: GetPresignedLinkQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PresignedUrlSchema,
        },
      },
      description: 'Get presign URL to upload file',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
