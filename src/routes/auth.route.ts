import { createRoute } from '@hono/zod-openapi';
import {
  AccessTokenSchema,
  BasicLoginBodySchema,
  BasicRegisterBodySchema,
  BasicVerifyAccountQuerySchema,
  BypassRegisterBodySchema,
  EmailBodySchema,
  GoogleCallbackQuerySchema,
  GoogleLoginAccessTokenSchema,
  JWTPayloadSchema,
  ResetPasswordBodySchema,
} from '~/types/auth.type';

import { createErrorResponse } from '../utils/error-response-factory';

/** BASIC AUTHENTICATION ROUTES (Email & Password) */
export const basicRegisterRoute = createRoute({
  operationId: 'basicRegister',
  tags: ['auth'],
  method: 'post',
  path: '/auth/basic/register',
  request: {
    body: {
      content: {
        'application/json': {
          schema: BasicRegisterBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    204: {
      description: 'Registration succesful. Verification token sent to email.',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const basicVerifyAccountRoute = createRoute({
  operationId: 'basicVerifyAccount',
  tags: ['auth'],
  method: 'post',
  path: '/auth/verify',
  request: {
    query: BasicVerifyAccountQuerySchema,
  },
  responses: {
    200: {
      description: 'Verification sucessful, automatic login',
      content: {
        'application/json': {
          schema: AccessTokenSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const basicLoginRoute = createRoute({
  operationId: 'basicLogin',
  tags: ['auth'],
  method: 'post',
  path: '/auth/basic/login',
  request: {
    body: {
      content: {
        'application/json': {
          schema: BasicLoginBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Login succesful',
      content: {
        'application/json': {
          schema: AccessTokenSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

/** GOOGLE AUTHENTICATION ROUTES */
export const googleAuthRoute = createRoute({
  operationId: 'googleAuth',
  tags: ['auth'],
  method: 'get',
  path: '/auth/google',
  responses: {
    200: {
      description: 'Redirect to Google login',
      headers: {
        location: {
          description: 'URL to Google consent screen',
          schema: {
            type: 'string',
          },
        },
      },
    },
  },
});

export const googleLoginAccessTokenRoute = createRoute({
  operationId: 'googleLoginAccessToken',
  tags: ['auth'],
  method: 'post',
  path: '/auth/google/login/accesstoken',
  request: {
    body: {
      content: {
        'application/json': {
          schema: GoogleLoginAccessTokenSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Google login access token successful',
      content: {
        'application/json': {
          schema: AccessTokenSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const googleAuthCallbackRoute = createRoute({
  operationId: 'googleAuthCallback',
  tags: ['auth'],
  method: 'get',
  path: '/auth/google/callback',
  request: {
    query: GoogleCallbackQuerySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AccessTokenSchema,
        },
      },
      description: 'Login succesful',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

/** BOTH AUTH */
export const logoutRoute = createRoute({
  operationId: 'logout',
  tags: ['auth'],
  method: 'post',
  path: '/auth/logout',
  responses: {
    204: {
      description: 'Logout sucessful',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    401: createErrorResponse('UNION', 'Unauthorized'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const selfRoute = createRoute({
  operationId: 'self',
  tags: ['auth'],
  method: 'get',
  path: '/auth/self',
  responses: {
    200: {
      description: 'Get self',
      content: {
        'application/json': {
          schema: JWTPayloadSchema,
        },
      },
    },
    401: createErrorResponse('GENERIC', 'Unauthorized'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const bypassRegisterRoute = createRoute({
  operationId: 'bypassRegister',
  path: '/auth/bypass/register',
  tags: ['auth'],
  method: 'post',
  request: {
    body: {
      content: {
        'application/json': {
          schema: BypassRegisterBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    204: {
      description: 'Registration succesful. Verification token sent to email.',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const forgotPasswordRoute = createRoute({
  operationId: 'forgotPassword',
  path: '/auth/forgot-password',
  tags: ['auth'],
  method: 'put',
  request: {
    body: {
      content: {
        'application/json': {
          schema: EmailBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Forgot password email sent',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const resetPasswordRoute = createRoute({
  operationId: 'resetPassword',
  path: '/auth/reset-password',
  tags: ['auth'],
  method: 'put',
  request: {
    body: {
      content: {
        'application/json': {
          schema: ResetPasswordBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Password reset successful',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
