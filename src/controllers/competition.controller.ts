import { roleMiddleware } from '~/middlewares/role-access.middleware';
import { createAuthRouter } from '~/utils/router-factory';
import { db } from '~/db/drizzle';

import {
	getAnnouncementsByCompetitionId,
  getCompetitionSubmissionById,
	getCompetition,
	getCompetitionParticipant,
	postAnnouncement,
} from '~/repositories/competition.repository';
import {
	getAdminCompAnnouncementRoute,
	getCompetitionParticipantRoute,
	postAdminCompAnnouncementRoute,
  getCompetitionSubmissionRoute,
} from '~/routes/competition.route';

export const competitionProtectedRouter = createAuthRouter();

competitionProtectedRouter.get(
	getCompetitionSubmissionRoute.getRoutingPath(),
	roleMiddleware('admin'),
);

competitionProtectedRouter.openapi(getCompetitionSubmissionRoute, async (c) => {
	const { page, limit } = c.req.valid('query');
	const { competitionId } = c.req.valid('param');

	const competitionSubmission = await getCompetitionSubmissionById(
		db,
		competitionId,
		{ page: Number(page), limit: Number(limit) },
	);

	return c.json(competitionSubmission, 200);
});

export const competitionProtectedRouter = createAuthRouter();

competitionProtectedRouter.get(
	getCompetitionParticipantRoute.getRoutingPath(),
	roleMiddleware('admin'),
);

competitionProtectedRouter.openapi(
	getCompetitionParticipantRoute,
	async (c) => {
		const { page, limit } = c.req.valid('query');
		const { competitionId } = c.req.valid('param');

		const competitionParticipant = await getCompetitionParticipant(
			db,
			competitionId,
			{ page: Number(page), limit: Number(limit) },
		);
		return c.json(competitionParticipant, 200);
	},
);

competitionProtectedRouter.get(
	getAdminCompAnnouncementRoute.getRoutingPath(),
	roleMiddleware('admin'),
);
competitionProtectedRouter.openapi(getAdminCompAnnouncementRoute, async (c) => {
	const { competitionId } = c.req.valid('param');

	// Check if competition exists
	const competition = await getCompetition(db, competitionId);
	if (!competition) return c.json({ error: "Competition doesn't exist!" }, 400);

	const announcements = await getAnnouncementsByCompetitionId(
		db,
		competitionId,
	);
	return c.json(announcements, 200);
});

competitionProtectedRouter.post(
	postAdminCompAnnouncementRoute.getRoutingPath(),
	roleMiddleware('admin'),
);
competitionProtectedRouter.openapi(
	postAdminCompAnnouncementRoute,
	async (c) => {
		const { competitionId } = c.req.valid('param');
		const body = c.req.valid('json');

		// Check if competition exists
		const competition = await getCompetition(db, competitionId);
		if (!competition)
			return c.json({ error: "Competition doesn't exist!" }, 400);

		// Create announcement
		const user = c.var.user;
		const announcement = await postAnnouncement(
			db,
			competitionId,
			user.id,
			body,
		);
		return c.json(announcement, 200);
	},
);

