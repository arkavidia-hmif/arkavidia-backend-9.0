import { and, count, eq, inArray } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import {
  competitionSubmissionRequirement,
  team,
  teamMember,
} from '~/db/schema';
import type {
  PostTeamDocumentBodySchema,
  PostTeamVerificationBodySchema,
  putChangeTeamNameBodySchema,
} from '~/types/team.type';

import {
  getCompetitionById,
  getCompetitionParticipantNumber,
} from './competition.repository';
import { insertMediaFromUrl } from './media.repository';
import {
  type TeamMemberRelationOption,
  getTeamMemberCount,
} from './team-member.repository';

interface TeamRelationOption {
  teamMember?: TeamMemberRelationOption | boolean;
  competition?: boolean;
  paymentProof?: boolean;
}

export const getTeamByCode = async (
  db: Database,
  teamCode: string,
  // options?: TeamRelationOption,
) => {
  return await db.query.team.findFirst({
    where: eq(team.joinCode, teamCode),
  });
};

export const getUserTeams = async (db: Database, userId: string) => {
  const userTeams = (
    await db.query.teamMember.findMany({
      where: eq(teamMember.userId, userId),
      columns: {
        teamId: true,
      },
    })
  ).map((t) => t.teamId);

  return await db.query.team.findMany({
    where: inArray(team.id, userTeams),
    with: {
      competition: true,
    },
  });
};

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

export const updateTeamDocument = async (
  db: Database,
  teamId: string,
  userId: string,
  data: z.infer<typeof PostTeamDocumentBodySchema>,
) => {
  const insert = {
    paymentProofMediaId: data.paymentProofMediaId
      ? (await insertMediaFromUrl(db, userId, data.paymentProofMediaId))[0].id
      : undefined,
  };

  return await db
    .update(team)
    .set(insert)
    .where(eq(team.id, teamId))
    .returning()
    .then(first);
};

export const changeTeamName = async (
  db: Database,
  teamId: string,
  body: z.infer<typeof putChangeTeamNameBodySchema>,
) => {
  return await db
    .update(team)
    .set({ name: body.name })
    .where(eq(team.id, teamId))
    .returning()
    .then(first);
};

export const deleteTeamMember = async (
  db: Database,
  teamId: string,
  userId: string,
) => {
  const where = and(
    eq(teamMember.teamId, teamId),
    eq(teamMember.userId, userId),
  );
  return await db.delete(teamMember).where(where).returning().then(first);
};

export const deleteTeam = async (db: Database, teamId: string) => {
  return await db
    .delete(team)
    .where(eq(team.id, teamId))
    .returning()
    .then(first);
};

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
      throw new Error(
        'Maximum number of participants reached for this competition.',
      );
    }

    const existingTeam = await db.query.team.findFirst({
      where: eq(team.name, name),
    });

    if (existingTeam) {
      throw new Error(`A team with the name "${name}" already exists.`);
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

    const existingLeader = await db.query.teamMember.findFirst({
      where: and(
        eq(teamMember.teamId, teamId),
        eq(teamMember.role, 'leader'), // Check for existing leader in the team
      ),
    });

    const roleNew = existingLeader ? 'member' : 'leader';

    const insertedMember = await tx
      .insert(teamMember)
      .values({
        teamId,
        userId,
        role: roleNew,
      })
      .returning()
      .then(first);

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

export const getTeamStatistic = async (db: Database) => {
  const allTeam = await db
    .select({
      totalTeam: count(),
    })
    .from(team)
    .groupBy(team.isVerified)
    .then(first);

  const allVerifiedTeam = await db
    .select({
      totalVerifiedTeam: count(),
    })
    .from(team)
    .where(eq(team.isVerified, true))
    .then(first);

  const compeTeams: {
    competitionId: string;
    totalTeam: number;
    totalVerifiedTeam?: number;
  }[] = await db
    .select({
      competitionId: team.competitionId,
      totalTeam: count(),
    })
    .from(team)
    .groupBy(team.competitionId, team.isVerified)
    .then((res) => res.map((r) => ({ ...r, competitionId: r.competitionId })));

  const compeTeamsVerified = await db
    .select({
      competitionId: team.competitionId,
      totalVerifiedTeam: count(),
    })
    .from(team)
    .where(eq(team.isVerified, true))
    .groupBy(team.competitionId)
    .then((res) => res.map((r) => ({ ...r, competitionId: r.competitionId })));

  compeTeams.forEach((team) => {
    const verifiedTeam = compeTeamsVerified.find(
      (vTeam) => vTeam.competitionId === team.competitionId,
    );
    team.totalVerifiedTeam = verifiedTeam?.totalVerifiedTeam || 0;
  });

  return { ...allTeam, ...allVerifiedTeam, result: compeTeams };
};

export const isUserInATeam = async (
  db: Database,
  userId: string,
  teamId: string,
) => {
  return await db.query.teamMember.findFirst({
    where: and(eq(teamMember.userId, userId), eq(teamMember.teamId, teamId)),
  });
};

export const getTeamDocumentVerification = async (
  db: Database,
  teamId: string,
) => {
  const teamMemberDocs = await db.query.teamMember.findMany({
    where: eq(teamMember.teamId, teamId),
    with: {
      nisn: true,
      kartu: true,
      poster: true,
      twibbon: true,
    },
  });
  return teamMemberDocs;
};

export const getVerificationRequirement = async (
  db: Database,
  teamId: string,
) => {
  const competitionId = await db.query.team.findFirst({
    where: eq(team.id, teamId),
    columns: {
      competitionId: true,
    },
  });

  if (!competitionId?.competitionId) {
    throw new Error('Competition ID not found');
  }

  const verificationRequirement =
    await db.query.competitionSubmissionRequirement.findFirst({
      where: and(
        eq(
          competitionSubmissionRequirement.competitionId,
          competitionId.competitionId,
        ),
        eq(competitionSubmissionRequirement.stage, 'verification'),
      ),
    });

  return verificationRequirement;
};
