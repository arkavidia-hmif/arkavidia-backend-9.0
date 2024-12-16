import { createRoute } from '@hono/zod-openapi';
import { createErrorResponse } from '~/utils/error-response-factory';
import {
	CompetitionIdParam,
	CompetitionSubmissionSchema,
	GetCompetitionSubmissionQuerySchema,
	AllAnnouncementSchema,
	AnnouncementSchema,
	CompetitionParticipantSchema,
	GetCompetitionTimeQuerySchema,
	PostCompAnnouncementBodySchema,
} from '~/types/competition.type';

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
	path: '/api/admin/{competitionId}/announcement',
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
