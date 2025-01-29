import { createRoute } from '@hono/zod-openapi';
import { roleMiddleware } from '~/middlewares/role-access.middleware';
import {
  CompetitionAndTeamIdAndSubmissionIdParam,
  CompetitionAndTeamIdParam,
  GroupedTeamSubmissionSchmea as GroupedTeamSubmissionSchema,
  PaginationQuerySchema,
  PutCompetitionTeamStatusSchema,
  PutTeamSubmissionVerdictSchema,
  PutTeamVerificationBodySchema,
  TeamsPaginatedSchema,
} from '~/types/admin-competition.type';
import {
  CompetitionIdParam,
  //   CompetitionSchema,
  ListCompetitionSchema,
} from '~/types/competition.type';
import {
  //   ListTeamSchema,
  TeamSchema,
  TeamSubmissionSchema,
  //   TeamSubmissionSchema,
} from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getAdminCompetitionsRoute = createRoute({
  operationId: 'getAdminCompetitions',
  description:
    "Gets admin's privileged competitions by role. For example, 'admin_competition_cp' can only see CP's admin page or 'admin_competition' can see all.",
  tags: ['admin-competition'],
  method: 'get',
  middleware: [roleMiddleware('admin_competition')] as const,
  path: '/admin/competition',
  responses: {
    200: {
      description: "Succesfully fetched admin's priveleged competitions.",
      content: {
        'application/json': {
          schema: ListCompetitionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getAdminAllCompetitionTeamsRoute = createRoute({
  operationId: 'getAdminAllCompetitionTeams',
  description:
    'Gets all teams in a competition; Only returns basic information.',
  tags: ['admin-competition'],
  method: 'get',
  middleware: [roleMiddleware('admin_competition')] as const,
  path: '/admin/competition/{competitionId}/team',
  request: {
    params: CompetitionIdParam,
    query: PaginationQuerySchema,
  },
  responses: {
    200: {
      description: 'Succesfully fetched all teams.',
      content: {
        'application/json': {
          schema: TeamsPaginatedSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getAdminCompetitionTeamInformationRoute = createRoute({
  operationId: 'getAdminCompetitionTeamInformation',
  description:
    'Gets team complete information, including: team documents, team member documents, team member (user) personal info.',
  tags: ['admin-competition'],
  method: 'get',
  middleware: [roleMiddleware('admin_competition')] as const,
  path: '/admin/competition/{competitionId}/team/{teamId}',
  request: {
    params: CompetitionAndTeamIdParam,
  },
  responses: {
    200: {
      description: "Succesfully fetched team's complete information.",
      content: {
        'application/json': {
          schema: TeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getAdminCompetitionTeamSubmissionsRoute = createRoute({
  operationId: 'getAdminCompetitionTeamSubmissions',
  description: "Gets team's submission grouped by stage.",
  tags: ['admin-competition'],
  method: 'get',
  middleware: [roleMiddleware('admin_competition')] as const,

  path: '/admin/competition/{competitionId}/team/{teamId}/submission',
  request: {
    params: CompetitionAndTeamIdParam,
  },
  responses: {
    200: {
      description: "Succesfully fetched team's submissions grouped by stage.",
      content: {
        'application/json': {
          schema: GroupedTeamSubmissionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const putAdminCompetitionTeamVerificationRoute = createRoute({
  operationId: 'putAdminCompetitionTeamVerification',
  description:
    "Updates team's verification status. Automatically handles team final status (DENIED/VERIFIED) and sends team verification email.",
  tags: ['admin-competition'],
  method: 'put',
  middleware: [roleMiddleware('admin_competition')] as const,
  path: '/admin/competition/{competitionId}/team/{teamId}/submission',
  request: {
    params: CompetitionAndTeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PutTeamVerificationBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Succesfully updated team's verification status.",
      content: {
        'application/json': {
          schema: TeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const putAdminCompetitionTeamStatusRoute = createRoute({
  operationId: 'putAdminCompetitionTeamStatus',
  description: "Updates team's final/pre-eliminary status.",
  tags: ['admin-competition'],
  method: 'put',
  middleware: [roleMiddleware('admin_competition')] as const,
  path: '/admin/competition/{competitionId}/team/{teamId}/status',
  request: {
    params: CompetitionAndTeamIdParam,
    body: {
      content: {
        'application/json': {
          schema: PutCompetitionTeamStatusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Succesfully updated team's verification status.",
      content: {
        'application/json': {
          schema: TeamSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const putAdminCompetitionTeamSubmissionVerdictRoute = createRoute({
  operationId: 'putAdminCompetitionTeamSubmissionVerdict',
  description: "Updates team's submission verdict.",
  tags: ['admin-competition'],
  method: 'put',
  middleware: [roleMiddleware('admin_competition')] as const,
  path: '/admin/competition/{competitionId}/team/{teamId}/submission/{submissionId}',
  request: {
    params: CompetitionAndTeamIdAndSubmissionIdParam,
    body: {
      content: {
        'application/json': {
          schema: PutTeamSubmissionVerdictSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Succesfully updated team's submission verdict.",
      content: {
        'application/json': {
          schema: TeamSubmissionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
