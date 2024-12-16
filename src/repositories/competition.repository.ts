import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { first } from '~/db/helper';
import type { PostCompAnnouncementBodySchema } from '~/types/competition.type';
import type { Database } from '../db/drizzle';
import { competition, competitionAnnouncement, team } from '../db/schema';

export const getCompetitionParticipantNumber = async (
	db: Database,
	competitionId: string,
) => {
	const result = await db.query.team.findMany({
		where: eq(team.competitionId, competitionId),
	});
	return { participantCount: result.length };
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
