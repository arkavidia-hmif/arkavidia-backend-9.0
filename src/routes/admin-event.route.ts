import { createRoute } from '@hono/zod-openapi';
import {
  EventAndTeamIdParam,
  GroupedEventTeamSubmissionSchema,
} from '~/types/admin-event.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getAdminEventsRoute = createRoute({
  operationId: 'getAdminEvents',
  description:
    "Gets admin's privileged event by role. For example, 'admin_event_softeng' can only see Softeng's admin page or 'admin_event' can see all.",
  tags: ['admin-event'],
  method: 'get',
  // middleware: [roleMiddleware('admin_event')] as const, // TODO: fix middleware for event (just leave this for now)
  path: '/admin/event',
  responses: {
    // 200: {
    //   description: "Succesfully fetched admin's priveleged competitions.",
    //   content: {
    //     'application/json': {
    //       schema: ListCompetitionSchema,
    //     },
    //   },
    // },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getAdminAllEventTeamsRoute = createRoute({
  operationId: 'getAdminAllEventTeams',
  description: 'Gets all teams in a event; Only returns basic information.',
  tags: ['admin-event'],
  method: 'get',
  // middleware: [roleMiddleware('admin_competition')] as const, // TODO: fix middleware for event (just leave this for now)
  path: '',
  request: {},
  responses: {
    // 200: {
    //   description: 'Succesfully fetched all teams.',
    //   content: {
    //     'application/json': {
    //       schema: TeamsPaginatedSchema,
    //     },
    //   },
    // },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getAdminEventTeamInformationRoute = createRoute({
  operationId: 'getAdminEventTeamInformation',
  description:
    'Gets team complete information, including: team documents, team member documents, team member (user) personal info.',
  tags: ['admin-event'],
  method: 'get',
  // middleware: [roleMiddleware('admin_competition')] as const, // TODO: fix middleware for event (just leave this for now)
  path: '/admin/event',
  request: {},
  responses: {
    // 200: {
    //   description: "Succesfully fetched team's complete information.",
    //   content: {
    //     'application/json': {
    //       schema: TeamSchema,
    //     },
    //   },
    // },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getAdminEventTeamSubmissionsRoute = createRoute({
  operationId: 'getAdminEventTeamSubmissions',
  description: "Gets team's submission grouped by stage.",
  tags: ['admin-event'],
  method: 'get',
  // middleware: [roleMiddleware('admin_competition')] as const, // TODO: fix middleware for event (just leave this for now)

  path: '/admin/event/{eventId}/team/{teamId}/submission',
  request: {
    params: EventAndTeamIdParam,
  },
  responses: {
    200: {
      description:
        "Succesfully fetched event team's submissions grouped by stage.",
      content: {
        'application/json': {
          schema: GroupedEventTeamSubmissionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const putAdminEventTeamVerificationRoute = createRoute({
  operationId: 'putAdminEventTeamVerification',
  description:
    "Updates team's verification status. Automatically handles team final status (DENIED/VERIFIED) and sends team verification email.",
  tags: ['admin-event'],
  method: 'put',
  // middleware: [roleMiddleware('admin_competition')] as const, // TODO: fix middleware for event (just leave this for now)
  path: '/admin/event',
  request: {},
  responses: {
    // 200: {
    //   description: "Succesfully updated team's verification status.",
    //   content: {
    //     'application/json': {
    //       schema: TeamSchema,
    //     },
    //   },
    // },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const putAdminEventTeamStatusRoute = createRoute({
  operationId: 'putAdminEventTeamStatus',
  description: "Updates team's final/pre-eliminary status.",
  tags: ['admin-event'],
  method: 'put',
  // middleware: [roleMiddleware('admin_competition')] as const, // TODO: fix middleware for event (just leave this for now)
  path: '/admin/event',
  request: {},
  responses: {
    // 200: {
    //   description: "Succesfully updated team's verification status.",
    //   content: {
    //     'application/json': {
    //       schema: TeamSchema,
    //     },
    //   },
    // },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const putAdminEventTeamSubmissionVerdictRoute = createRoute({
  operationId: 'putAdminEventTeamSubmissionVerdict',
  description: "Updates team's submission verdict.",
  tags: ['admin-event'],
  method: 'put',
  // middleware: [roleMiddleware('admin_competition')] as const, // TODO: fix middleware for event (just leave this for now)
  path: '/admin/event',
  request: {},
  responses: {
    // 200: {
    //   description: "Succesfully updated team's submission verdict.",
    //   content: {
    //     'application/json': {
    //       schema: TeamSubmissionSchema,
    //     },
    //   },
    // },
    400: createErrorResponse('UNION', 'Bad request error'),
    403: createErrorResponse('GENERIC', 'Not authorized for access'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
