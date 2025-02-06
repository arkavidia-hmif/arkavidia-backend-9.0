import { createRoute } from '@hono/zod-openapi';
import { cutResponseMiddleware } from '~/middlewares/cut-response.middleware';
import { isInCompTeamMiddleware } from '~/middlewares/is-in-team.middleware';
import { TeamMemberSchema } from '~/types/team-member.type';
import {
  InsertTeamSubmissionSchema,
  ListSubmissionRequirementSchema,
  ListTeamSchema,
  PostTeamBodySchema,
  PutChangeTeamNameBodySchema,
  PostTeamDocumentBodySchema as PutTeamDocumentBodySchema,
  TeamCodeBody,
  TeamIdParam,
  TeamMemberIdSchema,
  TeamSchema,
  TeamSubmissionSchema,
} from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getTeamsRoute = createRoute({
  operationId: 'getTeams',
  tags: ['team'],
  method: 'get',
  middleware: [
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team',
  responses: {
    200: {
      description: 'Get user teams',
      content: {
        'application/json': {
          schema: ListTeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getTeamByIdRoute = createRoute({
  operationId: 'getTeamById',
  tags: ['team'],
  method: 'get',
  middleware: [
    isInCompTeamMiddleware(),
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team/{teamId}',
  request: {
    params: TeamIdParam,
  },
  responses: {
    200: {
      description: 'Get team by id',
      content: {
        'application/json': {
          schema: TeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const postCreateTeamRoute = createRoute({
  operationId: 'postCreateTeam',
  tags: ['team'],
  method: 'post',
  middleware: [
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team',
  request: {
    body: {
      content: {
        'application/json': {
          schema: PostTeamBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TeamSchema,
        },
      },
      description: 'Successfully created a team',
    },
    400: createErrorResponse('UNION', 'Bad Request Error'),
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal Server Error'),
  },
});

export const joinTeamByCodeRoute = createRoute({
  operationId: 'joinTeamByCode',
  tags: ['team'],
  method: 'post',
  middleware: [
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team/join',
  request: {
    body: {
      content: {
        'application/json': {
          schema: TeamCodeBody,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TeamSchema,
        },
      },
      description: 'Successfully joined a team',
    },
    400: createErrorResponse('UNION', 'Bad Request Error'),
    500: createErrorResponse('GENERIC', 'Internal Server Error'),
  },
});

export const putChangeTeamNameRoute = createRoute({
  operationId: 'putChangeTeamName',
  tags: ['team'],
  method: 'put',
  middleware: [
    isInCompTeamMiddleware(),
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team/{teamId}',
  request: {
    params: TeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PutChangeTeamNameBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TeamSchema,
        },
      },
      description: 'Succesfully updated team name',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const deleteTeamMemberRoute = createRoute({
  operationId: 'deleteTeamMember',
  tags: ['team'],
  method: 'delete',
  middleware: [
    isInCompTeamMiddleware(),
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team/{teamId}',
  request: {
    params: TeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: TeamMemberIdSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TeamMemberSchema,
        },
      },
      description: 'Succesfully deleted team member',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const postQuitTeamRoute = createRoute({
  operationId: 'postQuitTeam',
  tags: ['team'],
  method: 'post',
  middleware: [
    isInCompTeamMiddleware(),
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team/{teamId}/quit',
  request: {
    params: TeamIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TeamSchema,
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
  middleware: [
    isInCompTeamMiddleware(),
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team/{teamId}/document',
  request: {
    params: TeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PutTeamDocumentBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TeamSchema,
        },
      },
      description: 'Succesfully updated team document upload',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getTeamSubmissionRoute = createRoute({
  operationId: 'getTeamSubmission',
  tags: ['team'],
  method: 'get',
  middleware: [
    isInCompTeamMiddleware(),
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team/{teamId}/submission',
  request: {
    params: TeamIdParam,
  },
  responses: {
    200: {
      description:
        'Successfully fetched team submitted and unsubmitted submission',
      content: {
        'application/json': {
          schema: ListSubmissionRequirementSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const putTeamSubmissionRoute = createRoute({
  operationId: 'putTeamSubmission',
  tags: ['team'],
  method: 'put',
  middleware: [
    isInCompTeamMiddleware(),
    cutResponseMiddleware(['finalStatus', 'preeliminaryStatus']),
  ] as const,
  path: '/team/{teamId}/submission',
  request: {
    params: TeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: InsertTeamSubmissionSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successfully uploaded submission',
      content: {
        'application/json': {
          schema: TeamSubmissionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
