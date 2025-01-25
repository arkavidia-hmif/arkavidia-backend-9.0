import { and, eq, inArray } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import {
  TeamDocumentTypeEnum,
  team,
  teamDocument,
  teamMember,
} from '~/db/schema';
import type {
  CreateTeamDocumentSchema,
  // PostTeamVerificationBodySchema,
  UpdateTeamDocumentSchema,
  UpdateTeamSchema,
  putChangeTeamNameBodySchema,
} from '~/types/team.type';

import { getCompetitionById } from './competition.repository';
import {
  type TeamMemberRelationOption,
  deleteAllTeamMemberDocument,
  getTeamMemberCount,
} from './team-member.repository';

interface TeamRelationOption {
  teamMember?: TeamMemberRelationOption | boolean;
  competition?: boolean;
  document?: boolean;
}

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

export const getTeamByCode = async (
  db: Database,
  teamCode: string,
  // options?: TeamRelationOption,
) => {
  return await db.query.team.findFirst({
    where: eq(team.joinCode, teamCode),
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
                user:
                  typeof options?.teamMember?.user === 'boolean'
                    ? options?.teamMember?.user
                      ? true
                      : undefined
                    : {
                        with: {
                          document: options?.teamMember?.user?.document
                            ? { with: { media: true } }
                            : undefined,
                          userIdentity: options?.teamMember?.user?.userIdentity
                            ? true
                            : undefined,
                        },
                      },
                document: options?.teamMember?.document
                  ? { with: { media: true } }
                  : undefined,
              },
            },
      competition: options?.competition ? true : undefined,
      document: options?.document ? { with: { media: true } } : undefined,
    },
  });
};

export const createTeam = async (
  db: Database,
  competitionId: string,
  name: string,
) => {
  return await db.transaction(async (tx) => {
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

export const updateTeam = async (
  db: Database,
  teamId: string,
  values: z.infer<typeof UpdateTeamSchema>,
) => {
  return await db
    .update(team)
    .set(values)
    .where(eq(team.id, teamId))
    .returning()
    .then(firstSure);
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
    const maxParticipants = (await getCompetitionById(db, team.competitionId))
      ?.maxParticipants;

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

export const deleteTeam = async (db: Database, teamId: string) => {
  const foundTeam = await getTeamById(db, teamId, { teamMember: true });
  if (!foundTeam) return;

  for (const tm of foundTeam.teamMembers) {
    await deleteAllTeamMemberDocument(db, tm.userId, teamId);
  }
  return await db
    .delete(team)
    .where(eq(team.id, teamId))
    .returning()
    .then(first);
};

/** Team Verification Documents */

export const getTeamDocument = async (
  db: Database,
  teamId: string,
  type: TeamDocumentTypeEnum,
) => {
  return db.query.teamDocument.findFirst({
    where: and(eq(teamDocument.teamId, teamId), eq(teamDocument.type, type)),
  });
};

export const createTeamDocument = async (
  db: Database,
  values: z.infer<typeof CreateTeamDocumentSchema>,
) => {
  return db.insert(teamDocument).values(values).returning();
};

export const updateTeamDocument = async (
  db: Database,
  teamId: string,
  values: z.infer<typeof UpdateTeamDocumentSchema>,
) => {
  return db
    .update(teamDocument)
    .set(values)
    .where(eq(teamDocument.teamId, teamId))
    .returning();
};

export const updatePaymentProofTeam = async (
  db: Database,
  teamId: string,
  paymentProofMediaId: string,
) => {
  const kartu = await getTeamDocument(db, teamId, 'bukti-pembayaran');
  if (kartu) {
    await updateTeamDocument(db, teamId, { mediaId: paymentProofMediaId });
  } else {
    await createTeamDocument(db, {
      teamId,
      mediaId: paymentProofMediaId,
      type: 'bukti-pembayaran',
    });
  }
};
