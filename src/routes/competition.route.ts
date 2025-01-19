import { createRoute } from '@hono/zod-openapi';
import {
  AllAnnouncementSchema,
  AnnouncementSchema,
  CompetitionIdParam,
  CompetitionIdQuery,
  CompetitionIdSchema,
  CompetitionNameQuery,
  CompetitionParticipantSchema,
  CompetitionSchema,
  CompetitionStatisticSchema,
  CompetitionSubmissionSchema,
  CompetitionTimelineSchema,
  FeedbackSubmissionBodySchema,
  GetCompetitionSubmissionQuerySchema,
  GetCompetitionTimeQuerySchema,
  PostCompAnnouncementBodySchema,
  StatusSubmissionSchema,
  TeamAndTypeIdParam,
} from '~/types/competition.type';
import {
  ListSubmissionRequirementSchema,
  StageQuery,
  TeamIdParam,
} from '~/types/team.type';
import { createErrorResponse } from '~/utils/error-response-factory';

export const getCompetitionSubmissionRoute = createRoute({
  operationId: 'getCompetitionSubmission',
  tags: ['admin', 'competition'],
  method: 'get',
  path: '/admin/{competitionId}/submission',
  request: {
    params: CompetitionIdParam,
    query: GetCompetitionSubmissionQuerySchema,
  },
  responses: {
    200: {
      description: "Fetched competition's submission.",
      content: {
        'application/json': {
          schema: CompetitionSubmissionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionSubmissionTeamRoute = createRoute({
  operationId: 'getCompetitionSubmissionTeam',
  tags: ['admin', 'competition'],
  method: 'get',
  path: '/admin/team/{teamId}/submission',
  request: {
    query: StageQuery,
    params: TeamIdParam,
  },
  responses: {
    200: {
      description: "Fetched team's submission.",
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

export const getAdminCompAnnouncementRoute = createRoute({
  operationId: 'getAdminCompAnnouncement',
  tags: ['admin', 'competition'],
  method: 'get',
  path: '/admin/{competitionId}/announcement',
  request: {
    params: CompetitionIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AllAnnouncementSchema,
        },
      },
      description: 'Succesfully fetched all announcements',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionParticipantRoute = createRoute({
  operationId: 'getCompetitionParticipant',
  tags: ['team', 'admin', 'competition'],
  method: 'get',
  path: '/admin/{competitionId}/team',
  request: {
    params: CompetitionIdParam,
    query: GetCompetitionTimeQuerySchema,
  },
  responses: {
    200: {
      description: "Fetched competition's participant.",
      content: {
        'application/json': {
          schema: CompetitionParticipantSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const postAdminCompAnnouncementRoute = createRoute({
  operationId: 'postAdminCompAnnouncement',
  tags: ['admin', 'competition'],
  method: 'post',
  path: '/admin/{competitionId}/announcement',
  request: {
    params: CompetitionIdParam,
    body: {
      content: {
        'application/json': {
          schema: PostCompAnnouncementBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AnnouncementSchema,
        },
      },
      description: 'Succesfully posted announcement',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionTimelineRoute = createRoute({
  operationId: 'getCompetitionTimeline',
  tags: ['competition'],
  method: 'get',
  path: '/competition/timeline',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CompetitionTimelineSchema,
        },
      },
      description: 'Successfully fetched competition timelines',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionTimeLineByCompetitionIdRoute = createRoute({
  operationId: 'getCompetitionTimelineWithCompetitionId',
  tags: ['competition'],
  method: 'get',
  path: '/competition/{competitionId}/timeline',
  request: {
    params: CompetitionIdParam,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CompetitionTimelineSchema,
        },
      },
      description: 'Successfully fetched competition timelines',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const updateSubmissionFeedbackRoute = createRoute({
  operationId: 'updateSubmissionFeedback',
  tags: ['admin', 'competition'],
  method: 'put',
  path: '/admin/submission/feedback/{teamId}/{typeId}',
  request: {
    params: TeamAndTypeIdParam,
    body: {
      content: {
        'application/json': {
          schema: FeedbackSubmissionBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Successfully updated submission feedback',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionSubmissionRequirementRoute = createRoute({
  operationId: 'getCompetitionSubmissionRequirement',
  tags: ['competition'],
  method: 'get',
  path: '/submission/requirement/{teamId}',
  request: {
    params: TeamIdParam,
  },
  responses: {
    200: {
      description: 'Successfully fetched competition submission requirement',
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

export const getCompetitionIdByNameRoute = createRoute({
  operationId: 'getCompetitionIdByName',
  tags: ['competition'],
  method: 'get',
  path: '/competition/id',
  request: {
    query: CompetitionNameQuery,
  },
  responses: {
    200: {
      description: 'Successfully fetched competition id',
      content: {
        'application/json': {
          schema: CompetitionIdSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionByIdRoute = createRoute({
  operationId: 'getCompetitionNameById',
  tags: ['competition'],
  method: 'get',
  path: '/competition/{competitionId}',
  request: {
    params: CompetitionIdParam,
  },
  responses: {
    200: {
      description: 'Successfully fetched competition name',
      content: {
        'application/json': {
          schema: CompetitionSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const getCompetitionStatisticRoute = createRoute({
  operationId: 'getCompetitionStatistic',
  tags: ['competition', 'admin'],
  method: 'get',
  path: '/admin/competition/requirement/statistic',
  request: {
    query: CompetitionIdQuery,
  },
  responses: {
    200: {
      description: 'Successfully fetched competition statistic',
      content: {
        'application/json': {
          schema: CompetitionStatisticSchema,
        },
      },
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});

export const updateSubmissionStatusRoute = createRoute({
  operationId: 'updateSubmissionStatus',
  tags: ['admin', 'competition'],
  method: 'put',
  path: '/admin/submission/status/{teamId}/{typeId}',
  request: {
    params: TeamAndTypeIdParam,
    body: {
      content: {
        'application/json': {
          schema: StatusSubmissionSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Successfully updated submission status',
    },
    400: createErrorResponse('UNION', 'Bad request error'),
    500: createErrorResponse('GENERIC', 'Internal server error'),
  },
});
