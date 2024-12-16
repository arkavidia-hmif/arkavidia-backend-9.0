import { eq, max } from 'drizzle-orm';
import type { Database } from '../db/drizzle';
import { competition, competitionSubmission, team } from '../db/schema';

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

	const result = await db.query.competitionSubmission.findMany({
		where: eq(competitionSubmission.competitionId, competitionId),
		limit,
		offset,
	});

	const totalItems = (
		await db.query.competitionSubmission.findMany({
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
