import { createRoute } from '@hono/zod-openapi';
import { TeamMemberSchema } from '~/types/team-member.type';
import {
  CompetitionAndTeamIdParam,
  ListUserTeamSchema,
  PostTeamBodySchema,
  PostTeamDocumentBodySchema,
  PostTeamVerificationBodySchema,
  TeamCodeBody,
  TeamCompetitionDetailSchema,
  TeamDocumentVerificationResponseSchema,
  TeamIdParam,
  TeamMemberIdSchema,
  TeamSchema,
  TeamStatisticSchema,
  putChangeTeamNameBodySchema,
} from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const joinTeamByCodeRoute = createRoute({
  operationId: 'joinTeamByCode',
  tags: ['team'],
  method: 'post',
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

export const getTeamsRoute = createRoute({
  operationId: 'getTeams',
  tags: ['team'],
  method: 'get',
  path: '/team',
  responses: {
    200: {
      description: 'Get user teams',
      content: {
        'application/json': {
          schema: ListUserTeamSchema,
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
    500: createErrorResponse('GENERIC', 'Internal Server Error'),
  },
});

export const postQuitTeamRoute = createRoute({
  operationId: 'postQuitTeam',
  tags: ['team'],
  method: 'post',
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

export const postTeamDocumentRoute = createRoute({
  operationId: 'postTeamDocument',
  tags: ['team'],
  method: 'put', // change method to put: method (post) and path intersect with other feature (team member document submit)
  path: '/team/{teamId}/upload',
  request: {
    params: TeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PostTeamDocumentBodySchema,
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

export const putChangeTeamNameRoute = createRoute({
  operationId: 'putChangeTeamName',
  tags: ['team'],
  method: 'put',
  path: '/team/{teamId}',
  request: {
    params: TeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: putChangeTeamNameBodySchema,
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

export const postTeamVerificationRoute = createRoute({
  operationId: 'postTeamVerification',
  tags: ['team', 'admin'],
  method: 'post',
  path: '/admin/{competitionId}/team/{teamId}',
  request: {
    params: CompetitionAndTeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PostTeamVerificationBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Succesfully updated team verification',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getTeamDetailRoute = createRoute({
  operationId: 'getTeamDetail',
  tags: ['team', 'admin'],
  method: 'get',
  path: '/admin/{competitionId}/team/{teamId}',
  request: {
    params: CompetitionAndTeamIdParam,
  },
  responses: {
    200: {
      description: 'Successfully get team detail',
      content: {
        'application/json': {
          schema: TeamCompetitionDetailSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getTeamStatisticRoute = createRoute({
  operationId: 'getTeamStatistic',
  tags: ['team', 'admin'],
  method: 'get',
  path: '/admin/team/statistic',
  responses: {
    200: {
      description: 'Successfully get team statistic',
      content: {
        'application/json': {
          schema: TeamStatisticSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getTeamDocumentVerificationRoute = createRoute({
  operationId: 'getTeamDocumentVerification',
  tags: ['team'],
  method: 'get',
  path: '/team/{teamId}/documentverification',
  request: {
    params: TeamIdParam,
  },
  responses: {
    200: {
      description: 'Successfully get team submission',
      content: {
        'application/json': {
          schema: TeamDocumentVerificationResponseSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
