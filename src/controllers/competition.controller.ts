import { db } from '~/db/drizzle';
import { roleMiddleware } from '~/middlewares/role-access.middleware';
import {
  getAnnouncementsByCompetitionId,
  getCompetition,
  getCompetitionIdByName,
  getCompetitionParticipant,
  getCompetitionSubmissionById,
  // getCompetitionSubmissionByTeamId,
  getCompetitionSubmissionRequirementByTeamId,
  getCompetitionTimelines,
  getCompetitionTimelinesByCompetitionId,
  postAnnouncement,
  updateSubmissionFeedback,
} from '~/repositories/competition.repository';
import {
  getAdminCompAnnouncementRoute,
  getCompetitionByIdRoute,
  getCompetitionByNameRoute,
  getCompetitionParticipantRoute,
  getCompetitionSubmissionRequirementRoute,
  getCompetitionSubmissionRoute,
  getCompetitionSubmissionTeamRoute,
  getCompetitionTimeLineByCompetitionIdRoute,
  getCompetitionTimelineRoute,
  postAdminCompAnnouncementRoute,
  updateSubmissionFeedbackRoute,
} from '~/routes/competition.route';
import { createAuthRouter, createRouter } from '~/utils/router-factory';

export const competitionProtectedRouter = createAuthRouter();
export const competitionRouter = createRouter();

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

competitionProtectedRouter.openapi(
  getCompetitionSubmissionTeamRoute,
  async (c) => {
    try {
      const { teamId } = c.req.valid('param');
      const { stage } = c.req.valid('query');

      const competitionSubmission =
        await getCompetitionSubmissionRequirementByTeamId(
          db,
          teamId,
          undefined,
          stage,
        );

      return c.json(competitionSubmission, 200);
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        return c.json(
          {
            error: error.message,
          },
          500,
        );
      }

      return c.json(
        {
          error: 'Unexpected error occured',
        },
        500,
      );
    }
  },
);

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

competitionRouter.openapi(getCompetitionTimelineRoute, async (c) => {
  const user = c.get('user');
  const userId = user.id;
  const timelines = await getCompetitionTimelines(db, userId);
  return c.json(timelines, 200);
});

competitionRouter.openapi(
  getCompetitionTimeLineByCompetitionIdRoute,
  async (c) => {
    const { competitionId } = c.req.valid('param');
    const timelines = await getCompetitionTimelinesByCompetitionId(
      db,
      competitionId,
    );
    return c.json(timelines, 200);
  },
);

competitionProtectedRouter.get(
  updateSubmissionFeedbackRoute.getRoutingPath(),
  roleMiddleware('admin'),
);

competitionProtectedRouter.openapi(updateSubmissionFeedbackRoute, async (c) => {
  const { teamId, typeId } = c.req.valid('param');
  const { feedback } = c.req.valid('json');

  // Update submission feedback
  const submission = await updateSubmissionFeedback(
    db,
    teamId,
    typeId,
    feedback,
  );
  return c.json(submission, 200);
});

competitionProtectedRouter.openapi(
  getCompetitionSubmissionRequirementRoute,
  async (c) => {
    try {
      const { teamId } = c.req.valid('param');
      const submission = await getCompetitionSubmissionRequirementByTeamId(
        db,
        teamId,
        c.var.user.id,
      );
      return c.json(submission, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json(
          {
            error: error.message,
          },
          500,
        );
      }

      return c.json(
        {
          error: 'Unexpected error occured',
        },
        500,
      );
    }
  },
);

competitionRouter.openapi(getCompetitionByNameRoute, async (c) => {
  const { name } = c.req.valid('query');
  const competition = await getCompetitionIdByName(db, name);
  return c.json(competition, 200);
});

competitionProtectedRouter.openapi(getCompetitionByIdRoute, async (c) => {
  const { competitionId } = c.req.valid('param');
  const competition = await getCompetition(db, competitionId);
  return c.json(competition, 200);
});
