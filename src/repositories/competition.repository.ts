import { aliasedTable, and, count, eq, gt, isNull, or } from 'drizzle-orm';
import { type z } from 'zod';
import { first } from '~/db/helper';
import type { PostCompAnnouncementBodySchema } from '~/types/competition.type';

import type { Database } from '../db/drizzle';
import {
  competition,
  competitionAnnouncement,
  competitionSubmission,
  competitionSubmissionRequirement,
  competitionTimeline,
  media,
  team,
  teamMember,
} from '../db/schema';

export const getAllCompetitions = async (db: Database) => {
  const competitions = await db.query.competition.findMany();
  return competitions.map((competition) => competition.id);
};

export const getCompetitionParticipantNumber = async (
  db: Database,
  competitionId: string,
) => {
  const result = await db.query.team.findMany({
    where: eq(team.competitionId, competitionId),
  });
  return { participantCount: result.length };
};

export const getCompetitionParticipant = async (
  db: Database,
  competitionId: string,
  options: { page: number; limit: number },
) => {
  const { page, limit } = options;
  const offset = (page - 1) * limit;

  const result = await db.query.team.findMany({
    where: eq(team.competitionId, competitionId),
    limit,
    offset,
  });

  const totalItems = (
    await db.query.team.findMany({
      where: eq(team.competitionId, competitionId),
    })
  ).length;

  const totalPages = Math.ceil(totalItems / limit);
  const next = page < totalPages ? `?page=${page + 1}&limit=${limit}` : null;
  const prev = page > 1 ? `?page=${page - 1}&limit=${limit}` : null;

  return {
    pagination: {
      currentPage: page,
      totalItems,
      totalPages,
      next,
      prev,
    },
    result,
  };
};

export const getCompetitionById = async (
  db: Database,
  competitionId: string,
) => {
  const result = await db.query.competition.findFirst({
    where: eq(competition.id, competitionId),
  });

  return { maxParticipants: result?.maxParticipants };
};

//
export const getCompetitionSubmissionByTeamId = async (
  db: Database,
  teamId: string,
) => {
  const submissions = await db.query.competitionSubmission.findMany({
    where: eq(competitionSubmission.teamId, teamId),
    with: {
      file: true,
      requirement: true,
    },
  });

  return submissions;
};

export const getCompetitionSubmissionRequirementByTeamId = async (
  db: Database,
  teamId: string,
  userId: string | undefined = undefined,
  stage: string | undefined = undefined,
) => {
  // Check if user is in team
  if (userId) {
    const isUserInTeam = await db
      .select()
      .from(teamMember)
      .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
      .then(first);

    if (!isUserInTeam) {
      throw new Error('User are not in team!');
    }
  }

  // find compe id
  const teamResult = await db.query.team.findFirst({
    where: eq(team.id, teamId),
  });

  if (!teamResult) {
    throw new Error('Team not found');
  }

  const competitionId = teamResult.competitionId;

  const requirement = aliasedTable(
    competitionSubmissionRequirement,
    'requirement',
  );

  const where = stage
    ? and(
        or(
          eq(competitionSubmission.teamId, teamId),
          isNull(competitionSubmission.teamId),
        ),
        eq(
          requirement.stage,
          stage as 'pre-eliminary' | 'final' | 'verification',
        ),
        eq(requirement.competitionId, competitionId),
      )
    : and(
        or(
          eq(competitionSubmission.teamId, teamId),
          isNull(competitionSubmission.teamId),
        ),
        eq(requirement.competitionId, competitionId),
      );

  const submissions = await db
    .select()
    .from(requirement)
    .leftJoin(
      competitionSubmission,
      eq(competitionSubmission.typeId, requirement.typeId),
    )
    .leftJoin(media, eq(competitionSubmission.mediaId, media.id))
    .where(where)
    .orderBy(requirement.deadline, requirement.typeName);

  return submissions;
};

export const getCompetitionSubmissionById = async (
  db: Database,
  competitionId: string,
  options: {
    page: number;
    limit: number;
  },
) => {
  const { page, limit } = options;
  const offset = (page - 1) * limit;

  const totalTeam = (
    await db.query.team.findMany({
      where: eq(team.competitionId, competitionId),
    })
  ).length;

  const resultTeam = await db.query.team.findMany({
    where: eq(team.competitionId, competitionId),
    limit,
    offset,
  });

  const result = [];
  for (const team of resultTeam) {
    const submissions = await db.query.competitionSubmission.findMany({
      where: eq(competitionSubmission.teamId, team.id),
    });

    const documents = [];
    for (const submission of submissions) {
      const mediaInfo = submission.mediaId
        ? await db.query.media.findFirst({
            where: eq(media.id, submission.mediaId),
          })
        : null;

      // optimize this ???
      const typeName =
        await db.query.competitionSubmissionRequirement.findFirst({
          where: eq(competitionSubmissionRequirement.typeId, submission.typeId),
        });

      documents.push({
        mediaInfo,
        created_at: submission.createdAt,
        updated_at: submission.updatedAt,
        type_name: typeName?.typeName,
      });
    }

    result.push({
      teamId: team.id,
      teamName: team.name,
      documents,
    });
  }

  const totalPages = Math.ceil(totalTeam / limit);
  const next = page < totalPages ? `?page=${page + 1}&limit=${limit}` : null;
  const prev = page > 1 ? `?page=${page - 1}&limit=${limit}` : null;

  return {
    pagination: {
      currentPage: page,
      totalTeam,
      totalPages,
      next,
      prev,
    },
    result,
  };
};

export const getCompetition = async (db: Database, competitionId: string) => {
  const result = await db.query.competition.findFirst({
    where: eq(competition.id, competitionId),
  });
  return result;
};

export const getAnnouncementsByCompetitionId = async (
  db: Database,
  competitionId: string,
) => {
  const result = await db.query.competitionAnnouncement.findMany({
    where: eq(competitionAnnouncement.competitionId, competitionId),
  });
  return result;
};

export const postAnnouncement = async (
  db: Database,
  competitionId: string,
  authorId: string,
  body: z.infer<typeof PostCompAnnouncementBodySchema>,
) => {
  return await db
    .insert(competitionAnnouncement)
    .values({
      competitionId: competitionId,
      authorId: authorId,
      title: body.title,
      description: body.description,
    })
    .returning()
    .then(first);
};

export const initializelCompetitionSubmissions = async (
  db: Database,
  teamId: string,
  competitionId: string,
) => {
  const requirementList = await getCompetitionRequirementById(
    db,
    competitionId,
  );

  const submissionResult = [];
  for (const requirement of requirementList) {
    // do the insertion
    const res = await postCompetitionSubmission(db, teamId, requirement.typeId);
    submissionResult.push(res);
  }

  return submissionResult;
};

export const getCompetitionRequirementById = async (
  db: Database,
  competitionId: string,
) => {
  const result = await db.query.competitionSubmissionRequirement.findMany({
    where: eq(competitionSubmissionRequirement.competitionId, competitionId),
  });

  return result;
};

export const postCompetitionSubmission = async (
  db: Database,
  teamId: string,
  typeId: string,
) => {
  return await db
    .insert(competitionSubmission)
    .values({
      teamId: teamId,
      typeId: typeId,
    })
    .returning();
};

export const getCompetitionTimelines = async (db: Database, userId: string) => {
  // Get user's competitions
  const userTeams = await db.query.team.findMany({
    where: eq(teamMember.userId, userId),
    with: {
      competition: {
        with: {
          timeline: true,
        },
      },
    },
  });

  return userTeams.flatMap((team) => team.competition.timeline);
};

export const getCompetitionTimelinesByCompetitionId = async (
  db: Database,
  competitionId: string,
) => {
  const result = await db.query.competitionTimeline.findMany({
    where: eq(competitionTimeline.competitionId, competitionId),
  });
  return result;
};

export const updateSubmissionFeedback = async (
  db: Database,
  teamId: string,
  typeId: string,
  feedback: string,
) => {
  return await db
    .update(competitionSubmission)
    .set({
      judgeResponse: feedback,
    })
    .where(
      and(
        eq(competitionSubmission.teamId, teamId),
        eq(competitionSubmission.typeId, typeId),
      ),
    )
    .returning();
};

export const getCompetitionIdByName = async (
  db: Database,
  name: string | undefined,
) => {
  const where = name ? eq(competition.title, name) : undefined;

  const result = await db.query.competition.findMany({
    where,
  });
  return result;
};

export const getCompetitionStageByTeamId = async (
  db: Database,
  teamId: string,
) => {
  const teamResult = await db.query.team.findFirst({
    where: eq(team.id, teamId),
    columns: {
      competitionId: true,
    },
  });

  if (!teamResult) {
    throw new Error('Team not found');
  }

  const comp_submission =
    await db.query.competitionSubmissionRequirement.findFirst({
      where: and(
        eq(
          competitionSubmissionRequirement.competitionId,
          teamResult.competitionId,
        ),
        gt(competitionSubmissionRequirement.startDate, new Date()),
      ),
      columns: {
        stage: true,
      },
      orderBy: (requirement, { desc }) => [desc(requirement.startDate)],
    });

  if (!comp_submission) {
    throw new Error('Stage in Competition not found');
  }

  return comp_submission.stage;
};

export const getCompetitionStatistic = async (
  db: Database,
  competitionId?: string,
) => {
  const where = competitionId ? eq(competition.id, competitionId) : undefined;
  const submission = await db
    .select({
      competitionId: competitionSubmissionRequirement.competitionId,
      typeId: competitionSubmissionRequirement.typeId,
      typeName: competitionSubmissionRequirement.typeName,
      deadline: competitionSubmissionRequirement.deadline,
      submitedTeams: count(competitionSubmission.teamId),
    })
    .from(competitionSubmissionRequirement)
    .leftJoin(
      competitionSubmission,
      eq(competitionSubmissionRequirement.typeId, competitionSubmission.typeId),
    )
    .where(where)
    .groupBy(
      competitionSubmissionRequirement.competitionId,
      competitionSubmissionRequirement.typeId,
    );

  const parsedSubmission: {
    competitionId: string;
    submissions: {
      typeId: string;
      typeName: string;
      submitedTeams: number;
      deadline: Date | null;
    }[];
  }[] = [];

  submission.forEach(
    (element: {
      competitionId: string;
      typeId: string;
      typeName: string;
      deadline: Date | null;
      submitedTeams: number;
    }) => {
      const existing = parsedSubmission.find(
        (item) => item.competitionId === element.competitionId,
      );

      if (existing) {
        existing.submissions.push({
          typeId: element.typeId,
          typeName: element.typeName,
          submitedTeams: element.submitedTeams,
          deadline: element.deadline,
        });
      } else {
        parsedSubmission.push({
          competitionId: element.competitionId,
          submissions: [
            {
              typeId: element.typeId,
              typeName: element.typeName,
              submitedTeams: element.submitedTeams,
              deadline: element.deadline,
            },
          ],
        });
      }
    },
  );

  return parsedSubmission;
};
