import { and, eq } from 'drizzle-orm';
import type { z } from 'zod';
import type { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import {
  TeamMemberDocumentTypeEnum,
  team,
  teamMember,
  teamMemberDocument,
} from '~/db/schema';
import type {
  InsertTeamMemberDocumentSchema,
  UpdateTeamMemberDocumentSchema,
} from '~/types/team-member.type';

import { getCompetitionById } from './competition.repository';
import { getTeamById } from './team.repository';
import { UserRelationOption } from './user.repository';

export interface TeamMemberRelationOption {
  user?: UserRelationOption;
  document?: boolean;
}

export const getTeamMember = async (
  db: Database,
  teamId: string,
  userId: string,
  options?: TeamMemberRelationOption,
) => {
  return await db.query.teamMember.findFirst({
    where: and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)),
    with: {
      document: options?.document ? { with: { media: true } } : undefined,
      user:
        typeof options?.user === 'boolean'
          ? options?.user
            ? true
            : undefined
          : {
              with: {
                document: options?.user?.document
                  ? { with: { media: true } }
                  : undefined,
              },
            },
    },
  });
};

export const getAllTeamMembers = async (
  db: Database,
  teamId: string,
  options?: TeamMemberRelationOption,
) => {
  return await db.query.teamMember.findMany({
    where: and(eq(teamMember.teamId, teamId)),
    with: {
      document: options?.document ? { with: { media: true } } : undefined,
      user:
        typeof options?.user === 'boolean'
          ? options?.user
            ? true
            : undefined
          : {
              with: {
                document: options?.user?.document
                  ? { with: { media: true } }
                  : undefined,
              },
            },
    },
  });
};

export const getTeamMemberCount = async (db: Database, teamId: string) => {
  const result = await db.query.teamMember.findMany({
    where: eq(teamMember.teamId, teamId),
    columns: {
      teamId: true,
    },
  });

  return { teamMemberCount: result.length };
};

export const isUserInTeam = async (
  db: Database,
  teamId: string,
  userId: string,
) => {
  const x = await db.query.teamMember.findFirst({
    where: and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)),
    columns: { userId: true },
  });
  if (!x) return false;
  return true;
};

export const isUserInOtherTeam = async (
  db: Database,
  userId: string,
  competitionId: string,
): Promise<boolean> => {
  const where = and(
    eq(teamMember.userId, userId),
    eq(team.competitionId, competitionId),
  );

  const existingTeamMember = await db
    .select()
    .from(teamMember)
    .innerJoin(team, eq(teamMember.teamId, team.id))
    .where(where);

  //console.log('existingTeamMember', existingTeamMember);

  // Check if the team is in the same competition
  return !!existingTeamMember.length;
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

export const deleteTeamMember = async (
  db: Database,
  teamId: string,
  userId: string,
) => {
  await deleteAllTeamMemberDocument(db, userId, teamId);

  const where = and(
    eq(teamMember.teamId, teamId),
    eq(teamMember.userId, userId),
  );
  return await db.delete(teamMember).where(where).returning().then(first);
};

/** Team Member Verification Document */

export const getTeamMemberDocument = async (
  db: Database,
  userId: string,
  teamId: string,
  type: TeamMemberDocumentTypeEnum,
) => {
  return db.query.teamMemberDocument.findFirst({
    where: and(
      eq(teamMemberDocument.userId, userId),
      eq(teamMemberDocument.teamId, teamId),
      eq(teamMemberDocument.type, type),
    ),
  });
};

export const createTeamMemberDocument = async (
  db: Database,
  values: z.infer<typeof InsertTeamMemberDocumentSchema>,
) => {
  return await db.insert(teamMemberDocument).values(values).returning();
};

export const updateTeamMemberDocument = async (
  db: Database,
  userId: string,
  teamId: string,
  type: TeamMemberDocumentTypeEnum,
  values: z.infer<typeof UpdateTeamMemberDocumentSchema>,
) => {
  return await db
    .update(teamMemberDocument)
    .set(values)
    .where(
      and(
        eq(teamMemberDocument.teamId, teamId),
        eq(teamMemberDocument.userId, userId),
        eq(teamMemberDocument.type, type),
      ),
    )
    .returning();
};

export const deleteAllTeamMemberDocument = async (
  db: Database,
  userId: string,
  teamId: string,
) => {
  await db
    .delete(teamMemberDocument)
    .where(
      and(
        eq(teamMemberDocument.teamId, teamId),
        eq(teamMemberDocument.userId, userId),
      ),
    );
};

export const updatePosterTeamMember = async (
  db: Database,
  userId: string,
  teamId: string,
  posterMediaId: string,
) => {
  const poster = await getTeamMemberDocument(db, userId, teamId, 'poster');
  if (poster) {
    await updateTeamMemberDocument(db, userId, teamId, 'poster', {
      mediaId: posterMediaId,
    });
  } else {
    await createTeamMemberDocument(db, {
      userId,
      teamId,
      mediaId: posterMediaId,
      type: 'poster',
    });
  }
};

export const updateTwibbonTeamMember = async (
  db: Database,
  userId: string,
  teamId: string,
  twibbonMediaId: string,
) => {
  const twibbon = await getTeamMemberDocument(db, userId, teamId, 'twibbon');
  if (twibbon) {
    await updateTeamMemberDocument(db, userId, teamId, 'twibbon', {
      mediaId: twibbonMediaId,
    });
  } else {
    await createTeamMemberDocument(db, {
      userId,
      teamId,
      mediaId: twibbonMediaId,
      type: 'twibbon',
    });
  }
};

export const isTeamMemberDocumentsVerified = async (
  db: Database,
  teamId: string,
  userId: string,
): Promise<boolean> => {
  const documents = await db.query.teamMemberDocument.findMany({
    where: and(
      eq(teamMemberDocument.teamId, teamId),
      eq(teamMemberDocument.userId, userId),
    ),
  });

  const twibbonDocument = documents.find((d) => d.type === 'twibbon');
  const posterDocument = documents.find((d) => d.type === 'poster');

  return !!twibbonDocument?.isVerified && !!posterDocument?.isVerified;
};
