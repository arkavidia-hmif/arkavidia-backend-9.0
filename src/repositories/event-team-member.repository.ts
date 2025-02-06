import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import {
  EventTeamMemberDocumentTypeEnum,
  eventTeam,
  eventTeamMember,
  eventTeamMemberDocument,
} from '~/db/schema';
import {
  InsertEventTeamMemberDocumentSchema,
  UpdateEventTeamMemberDocumentSchema,
} from '~/types/event-team-member.type';

import { UserRelationOption } from './user.repository';

export interface EventTeamMemberRelationOption {
  user?: UserRelationOption;
  document?: boolean;
}

export const getAllEventTeamMembers = async (
  db: Database,
  teamId: string,
  options?: EventTeamMemberRelationOption,
) => {
  return await db.query.eventTeamMember.findMany({
    where: and(eq(eventTeamMember.teamId, teamId)),
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

export const getEventTeamMember = async (
  db: Database,
  teamId: string,
  userId: string,
  options?: EventTeamMemberRelationOption,
) => {
  return await db.query.eventTeamMember.findFirst({
    where: and(
      eq(eventTeamMember.teamId, teamId),
      eq(eventTeamMember.userId, userId),
    ),
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

export const getUserEventTeamMember = async (db: Database, userId: string) => {
  return await db.query.eventTeamMember.findMany({
    where: eq(eventTeamMember.userId, userId),
  });
};

export const getEventTeamMemberCount = async (db: Database, teamId: string) => {
  const result = await db.query.eventTeamMember.findMany({
    where: eq(eventTeamMember.teamId, teamId),
    columns: {
      teamId: true,
    },
  });

  return { teamMemberCount: result.length };
};

export const isUserInEventTeam = async (
  db: Database,
  teamId: string,
  userId: string,
) => {
  const x = await db.query.eventTeamMember.findFirst({
    where: and(
      eq(eventTeamMember.teamId, teamId),
      eq(eventTeamMember.userId, userId),
    ),
    columns: { userId: true },
  });
  if (!x) return false;
  return true;
};

export const isUserInOtherTeam = async (
  db: Database,
  userId: string,
  eventId: string,
): Promise<boolean> => {
  const where = and(
    eq(eventTeamMember.userId, userId),
    eq(eventTeam.eventId, eventId),
  );

  const existingTeamMember = await db
    .select()
    .from(eventTeamMember)
    .innerJoin(eventTeam, eq(eventTeamMember.teamId, eventTeam.id))
    .where(where);

  return !!existingTeamMember.length;
};

export const deleteEventTeamMember = async (
  db: Database,
  teamId: string,
  userId: string,
) => {
  await deleteAllEventTeamMemberDocument(db, userId, teamId);

  const where = and(
    eq(eventTeamMember.teamId, teamId),
    eq(eventTeamMember.userId, userId),
  );
  return await db
    .delete(eventTeamMember)
    .where(where)
    .returning()
    .then(firstSure);
};

/** Event Team Member Verification Document */

export const getEventTeamMemberDocument = async (
  db: Database,
  userId: string,
  teamId: string,
  type: EventTeamMemberDocumentTypeEnum,
) => {
  return await db.query.eventTeamMemberDocument.findFirst({
    where: and(
      eq(eventTeamMemberDocument.userId, userId),
      eq(eventTeamMemberDocument.teamId, teamId),
      eq(eventTeamMemberDocument.type, type),
    ),
  });
};

export const getAllEventTeamMemberDocuments = async (
  db: Database,
  userId: string,
  teamId: string,
) => {
  const twibbon = await getEventTeamMemberDocument(
    db,
    userId,
    teamId,
    'twibbon',
  );
  const poster = await getEventTeamMemberDocument(db, userId, teamId, 'poster');
  return { twibbon, poster };
};

export const countAllEventTeamMemberDocuments = async (
  db: Database,
  userId: string,
  teamId: string,
) => {
  const docs = await getAllEventTeamMemberDocuments(db, userId, teamId);
  return Number(!!docs.twibbon) + Number(!!docs.poster);
};

export const createEventTeamMemberDocument = async (
  db: Database,
  values: z.infer<typeof InsertEventTeamMemberDocumentSchema>,
) => {
  return await db.insert(eventTeamMemberDocument).values(values).returning();
};

export const updateEventTeamMemberDocument = async (
  db: Database,
  userId: string,
  teamId: string,
  type: EventTeamMemberDocumentTypeEnum,
  values: z.infer<typeof UpdateEventTeamMemberDocumentSchema>,
) => {
  return await db
    .update(eventTeamMemberDocument)
    .set(values)
    .where(
      and(
        eq(eventTeamMemberDocument.teamId, teamId),
        eq(eventTeamMemberDocument.userId, userId),
        eq(eventTeamMemberDocument.type, type),
      ),
    )
    .returning();
};

export const deleteAllEventTeamMemberDocument = async (
  db: Database,
  userId: string,
  teamId: string,
) => {
  await db
    .delete(eventTeamMemberDocument)
    .where(
      and(
        eq(eventTeamMemberDocument.teamId, teamId),
        eq(eventTeamMemberDocument.userId, userId),
      ),
    );
};

export const updatePosterEventTeamMember = async (
  db: Database,
  userId: string,
  teamId: string,
  posterMediaId: string,
) => {
  const poster = await getEventTeamMemberDocument(db, userId, teamId, 'poster');
  if (poster) {
    await updateEventTeamMemberDocument(db, userId, teamId, 'poster', {
      mediaId: posterMediaId,
    });
  } else {
    await createEventTeamMemberDocument(db, {
      userId,
      teamId,
      mediaId: posterMediaId,
      type: 'poster',
      isVerified: false,
      verificationError: null,
    });
  }
};

export const updateTwibbonEventTeamMember = async (
  db: Database,
  userId: string,
  teamId: string,
  twibbonMediaId: string,
) => {
  const twibbon = await getEventTeamMemberDocument(
    db,
    userId,
    teamId,
    'twibbon',
  );
  if (twibbon) {
    await updateEventTeamMemberDocument(db, userId, teamId, 'twibbon', {
      mediaId: twibbonMediaId,
    });
  } else {
    await createEventTeamMemberDocument(db, {
      userId,
      teamId,
      mediaId: twibbonMediaId,
      type: 'twibbon',
      isVerified: false,
      verificationError: null,
    });
  }
};

export const isEventTeamMemberDocumentsVerified = async (
  db: Database,
  teamId: string,
  userId: string,
): Promise<boolean> => {
  const documents = await db.query.eventTeamMemberDocument.findMany({
    where: and(
      eq(eventTeamMemberDocument.teamId, teamId),
      eq(eventTeamMemberDocument.userId, userId),
    ),
  });

  const twibbonDocument = documents.find((d) => d.type === 'twibbon');
  const posterDocument = documents.find((d) => d.type === 'poster');

  return !!twibbonDocument?.isVerified && !!posterDocument?.isVerified;
};

export const isEventTeamMemberDocumentsPresent = async (
  db: Database,
  teamId: string,
  userId: string,
) => {
  const documents = await db.query.eventTeamMemberDocument.findMany({
    where: and(
      eq(eventTeamMemberDocument.teamId, teamId),
      eq(eventTeamMemberDocument.userId, userId),
    ),
  });

  const twibbonDocument = documents.find((d) => d.type === 'twibbon');
  const posterDocument = documents.find((d) => d.type === 'poster');

  return !!twibbonDocument && !!posterDocument;
};
