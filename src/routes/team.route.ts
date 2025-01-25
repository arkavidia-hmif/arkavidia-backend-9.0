import { createRoute } from '@hono/zod-openapi';
import { TeamMemberSchema } from '~/types/team-member.type';
import {
  CompetitionAndTeamIdParam,
  InsertTeamSubmissionSchema,
  ListSubmissionRequirementSchema,
  ListUserTeamSchema,
  PostTeamBodySchema,
  PostTeamVerificationBodySchema as PostTeamVerificationFeedbackBodySchema,
  PutChangeTeamNameBodySchema,
  PostTeamDocumentBodySchema as PutTeamDocumentBodySchema,
  TeamCodeBody,
  TeamCompetitionDetailSchema,
  TeamIdParam,
  TeamMemberIdSchema,
  TeamSchema,
  TeamSubmissionSchema,
} from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

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
    403: createErrorResponse('UNION', 'Forbidden'),
    500: createErrorResponse('GENERIC', 'Internal Server Error'),
  },
});

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

export const postTeamVerificationFeedbackRoute = createRoute({
  operationId: 'postTeamVerificationFeedback',
  tags: ['team', 'admin'],
  method: 'post',
  path: '/admin/competition/{competitionId}/team/{teamId}',
  request: {
    params: CompetitionAndTeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PostTeamVerificationFeedbackBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Succesfully updated team verification',
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

export const getTeamDetailRoute = createRoute({
  operationId: 'getTeamDetail',
  tags: ['team', 'admin'],
  method: 'get',
  path: '/admin/competition/{competitionId}/team/{teamId}',
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
