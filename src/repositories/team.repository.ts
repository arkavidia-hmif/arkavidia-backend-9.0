import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { team, teamMember } from '~/db/schema';
import { type TeamMemberRelationOption, getTeamMemberCount } from './team-member.repository';
import type { PostTeamVerificationBodySchema, putChangeTeamNameBodySchema, TeamMemberIdSchema } from '~/types/team.type';
import { z } from 'zod';
import { first } from '~/db/helper';
import {
	getCompetitionById,
	getCompetitionParticipantNumber,
} from './competition.repository';

interface TeamRelationOption {
	teamMember?: TeamMemberRelationOption | boolean;
	competition?: boolean;
	paymentProof?: boolean;
}

export const getTeamById = async (
	db: Database,
	teamId: string,
	options?: TeamRelationOption,
) => {
	return await db.query.team.findFirst({
		where: eq(team.id, teamId),
		with: {
			teamMembers:
				typeof options?.teamMember === 'boolean'
					? options?.teamMember
						? true
						: undefined
					: {
							with: {
								user: options?.teamMember?.user ? true : undefined,
								nisn: options?.teamMember?.nisn ? true : undefined,
								kartu: options?.teamMember?.kartu ? true : undefined,
								poster: options?.teamMember?.poster ? true : undefined,
								twibbon: options?.teamMember?.twibbon ? true : undefined,
							},
						},
			competition: options?.competition ? true : undefined,
			paymentProof: options?.paymentProof ? true : undefined,
		},
	});
};

export const putChangeTeamName = async (
	db: Database,
	teamId: string,
	body: z.infer<typeof putChangeTeamNameBodySchema>
) => {
	return await db
		.update(team)
		.set({ name: body.name })
		.where(eq(team.id, teamId))
		.returning()
		.then(first);
}


export const deleteTeamMember = async (
	db: Database,
	body: z.infer<typeof TeamMemberIdSchema>
) => {
	return await db
		.delete(teamMember)
		.where(eq(teamMember.userId, body.userId))
		.returning()
		.then(first);
}
=======
export const createTeam = async (
	db: Database,
	competitionId: string,
	name: string,
) => {
	return await db.transaction(async (tx) => {
		const { participantCount } = await getCompetitionParticipantNumber(
			db,
			competitionId,
		);
		const { maxParticipants } = await getCompetitionById(db, competitionId);

		if (!maxParticipants) {
			throw new Error('There is no such competition');
		}

		if (maxParticipants <= participantCount) {
			// return an error ?
			throw new Error(
				'Maximum number of participants reached for this competition.',
			);
		}

		const [insertedTeam] = await tx
			.insert(team)
			.values({
				competitionId,
				name,
			})
			.returning();

		return insertedTeam;
	});
};

export const insertUserToTeam = async (
	db: Database,
	teamId: string,
	userId: string,
) => {
	return await db.transaction(async (tx) => {
		const team = await getTeamById(db, teamId);
		if (!team) {
			throw new Error("Such team doesn't exist");
		}

		const { teamMemberCount } = await getTeamMemberCount(db, teamId);
		const { maxParticipants } = await getCompetitionById(
			db,
			team.competitionId,
		);

		if (!maxParticipants) {
			throw new Error('There is no such competition');
		}
		if (maxParticipants <= teamMemberCount) {
			throw new Error('The team is already full');
		}

		const [insertedMember] = await tx
			.insert(teamMember)
			.values({
				teamId,
				userId,
				role: 'leader',
			})
			.returning();

		return insertedMember;
	});
};

export const updateTeamVerification = async (
	db: Database,
	teamId: string,
	data: z.infer<typeof PostTeamVerificationBodySchema>,
) => {
	return await db
		.update(team)
		.set(data)
		.where(eq(team.id, teamId))
		.returning()
		.then(first);
};
