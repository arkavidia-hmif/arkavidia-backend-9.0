import { and, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import {
  EventTeamDocumentTypeEnum,
  EventTeamFinalStatusEnum,
  EventTeamMember,
  EventTeamPreeliminaryStatusEnum,
  EventTeamVerificationStatusEnum,
  eventTeam,
  eventTeamDocument,
  eventTeamMember,
  eventTimeline,
  user,
} from '~/db/schema';
import { AdminAllEventTeamQuerySchema } from '~/types/admin-event.type';
import {
  CreateEventTeamDocumentSchema,
  UpdateEventTeamDocumentSchema,
  UpdateEventTeamSchema,
} from '~/types/event-team.type';

import {
  EventTeamMemberRelationOption,
  deleteAllEventTeamMemberDocument,
  getAllEventTeamMemberDocuments,
  isEventTeamMemberDocumentsPresent,
} from './event-team-member.repository';
import { getAllUserDocuments, isUserDocumentsPresent } from './user.repository';

interface EventTeamRelationOption {
  teamMember?: EventTeamMemberRelationOption | boolean;
  event?: boolean;
  document?: boolean;
  submission?: boolean;
}

export const getAllEventTeamsPaginated = async (
  db: Database,
  eventId: string,
  query: z.infer<typeof AdminAllEventTeamQuerySchema>,
) => {
  const page = Number(query.page);
  const limit = Number(query.limit);

  const offset = (page - 1) * limit;

  const searchQuery = query.search
    ? or(
        ilike(eventTeam.name, `%${query.search}%`),
        ilike(eventTeam.id, `%${query.search}%`),
      )
    : undefined;
  const stageQuery = query.stage ? eq(eventTeam.stage, query.stage) : undefined;
  const verifStatusQuery = query.verifStatus
    ? eq(eventTeam.verificationStatus, query.verifStatus)
    : undefined;
  const finalStatuQuery = query.finalStatus
    ? eq(eventTeam.finalStatus, query.finalStatus)
    : undefined;
  const prelimStatusQuery = query.prelimStatus
    ? eq(eventTeam.preeliminaryStatus, query.prelimStatus)
    : undefined;

  const where = and(
    searchQuery,
    stageQuery,
    verifStatusQuery,
    finalStatuQuery,
    prelimStatusQuery,
  );

  const result = await db.query.eventTeam.findMany({
    where: and(eq(eventTeam.eventId, eventId), where),
    with: {
      document: true,
    },
    limit,
    offset,
    orderBy: [desc(eventTeam.createdAt)],
  });

  const totalItems = (
    await db.query.eventTeam.findMany({
      where: and(eq(eventTeam.eventId, eventId), where),
    })
  ).length;

  const totalPages = Math.ceil(totalItems / limit);
  const next =
    page < totalPages
      ? `?page=${page + 1}&limit=${limit}` +
        (query.search ? `&search=${query.search}` : '') +
        (query.stage ? `&stage=${query.stage}` : '') +
        (query.verifStatus ? `&verifStatus=${query.verifStatus}` : '') +
        (query.prelimStatus ? `&prelimStatus=${query.prelimStatus}` : '') +
        (query.finalStatus ? `&finalStatus=${query.finalStatus}` : '')
      : null;
  const prev =
    page > 1
      ? `?page=${page - 1}&limit=${limit}` +
        (query.search ? `&search=${query.search}` : '') +
        (query.stage ? `&stage=${query.stage}` : '') +
        (query.verifStatus ? `&verifStatus=${query.verifStatus}` : '') +
        (query.prelimStatus ? `&prelimStatus=${query.prelimStatus}` : '') +
        (query.finalStatus ? `&finalStatus=${query.finalStatus}` : '')
      : null;

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

export const getUserEventTeams = async (db: Database, userId: string) => {
  const userTeams = (
    await db.query.eventTeamMember.findMany({
      where: eq(eventTeamMember.userId, userId),
      columns: {
        teamId: true,
      },
    })
  ).map((t) => t.teamId);

  return await db.query.eventTeam.findMany({
    where: inArray(eventTeam.id, userTeams),
    with: {
      event: true,
    },
  });
};

export const getEventTeamById = async (
  db: Database,
  teamId: string,
  options?: EventTeamRelationOption,
) => {
  return await db.query.eventTeam.findFirst({
    where: eq(eventTeam.id, teamId),
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
      event: options?.event ? true : undefined,
      document: options?.document ? { with: { media: true } } : undefined,
      submission: options?.submission ? { with: { media: true } } : undefined,
    },
  });
};

export const getEventTeamByCode = async (
  db: Database,
  joinCode: string,
  options?: EventTeamRelationOption,
) => {
  return await db.query.eventTeam.findFirst({
    where: eq(eventTeam.joinCode, joinCode),
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
      event: options?.event ? true : undefined,
      document: options?.document ? { with: { media: true } } : undefined,
      submission: options?.submission ? { with: { media: true } } : undefined,
    },
  });
};

export const createEventTeam = async (
  db: Database,
  mode: 'solo' | 'team',
  userId: string,
  eventId: string,
  name?: string,
) => {
  // Check register deadline
  const firstEventTimeline = await db.query.eventTimeline.findFirst({
    where: and(
      ilike(eventTimeline.title, '%Registration'),
      eq(eventTimeline?.eventId, eventId),
    ),
    orderBy: [desc(eventTimeline?.endDate)],
  });

  if (!firstEventTimeline || !firstEventTimeline.endDate) {
    throw new Error('Event not found');
  }

  const now = new Date();

  if (now > firstEventTimeline?.endDate) {
    throw new Error('Registration deadline has passed');
  }

  if (mode === 'solo') {
    const userReq = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .then(first);

    return await db.transaction(async (trx) => {
      const event_team = await trx
        .insert(eventTeam)
        .values({
          name: userReq?.fullName ?? '',
          eventId,
        })
        .returning()
        .then(first);

      if (!event_team) {
        throw new Error('Failed to create team');
      }

      const event_team_member = await trx.insert(eventTeamMember).values({
        userId,
        teamId: event_team.id,
        role: 'leader',
      });

      return {
        event_team,
        event_team_member,
      };
    });
  } else {
    return await db.transaction(async (trx) => {
      const event_team = await trx
        .insert(eventTeam)
        .values({
          name: name ?? '',
          eventId,
        })
        .returning()
        .then(first);

      if (!event_team) {
        throw new Error('Failed to create team');
      }

      const event_team_member = await trx.insert(eventTeamMember).values({
        userId,
        teamId: event_team?.id,
        role: 'leader',
      });

      return {
        event_team,
        event_team_member,
      };
    });
  }
};

export const updateEventTeam = async (
  db: Database,
  teamId: string,
  values: z.infer<typeof UpdateEventTeamSchema>,
) => {
  return await db
    .update(eventTeam)
    .set(values)
    .where(eq(eventTeam.id, teamId))
    .returning()
    .then(firstSure);
};

export const deleteEventTeam = async (db: Database, teamId: string) => {
  const foundTeam = await getEventTeamById(db, teamId, { teamMember: true });
  if (!foundTeam) return;

  for (const tm of foundTeam.teamMembers) {
    await deleteAllEventTeamMemberDocument(db, tm.userId, teamId);
  }
  return await db
    .delete(eventTeam)
    .where(eq(eventTeam.id, teamId))
    .returning()
    .then(first);
};

/** Team Verification Documents */

export const getTeamDocument = async (
  db: Database,
  teamId: string,
  type: EventTeamDocumentTypeEnum,
) => {
  return db.query.teamDocument.findFirst({
    where: and(
      eq(eventTeamDocument.teamId, teamId),
      eq(eventTeamDocument.type, type),
    ),
  });
};

// export const getAllTeamDocuments = async (db: Database, teamId: string) => {
//   const buktiPembayaran = await getTeamDocument(db, teamId, 'bukti-pembayaran');
//   return { buktiPembayaran };
// };

export const createEventTeamDocument = async (
  db: Database,
  values: z.infer<typeof CreateEventTeamDocumentSchema>,
) => {
  return db.insert(eventTeamDocument).values(values).returning();
};

export const updateEventTeamDocument = async (
  db: Database,
  teamId: string,
  values: z.infer<typeof UpdateEventTeamDocumentSchema>,
) => {
  return db
    .update(eventTeamDocument)
    .set(values)
    .where(eq(eventTeamDocument.teamId, teamId))
    .returning();
};

// export const updateEventPaymentProofTeam = async (
//   db: Database,
//   teamId: string,
//   paymentProofMediaId: string,
// ) => {
//   const kartu = await getTeamDocument(db, teamId, 'bukti-pembayaran');
//   if (kartu) {
//     await updateTeamDocument(db, teamId, { mediaId: paymentProofMediaId });
//   } else {
//     await createTeamDocument(db, {
//       teamId,
//       mediaId: paymentProofMediaId,
//       type: 'bukti-pembayaran',
//       isVerified: false,
//       verificationError: null,
//     });
//   }
// };

// export const isEventTeamDocumentsVerified = async (
//   db: Database,
//   teamId: string,
// ): Promise<boolean> => {
//   const documents = await db.query.teamDocument.findMany({
//     where: eq(teamDocument.teamId, teamId),
//   });

//   const buktiPembayaranDocument = documents.find(
//     (d) => d.type === 'bukti-pembayaran',
//   );

//   return !!buktiPembayaranDocument?.isVerified;
// };

// export const isEventTeamDocumentsPresent = async (db: Database, teamId: string) => {
//   const documents = await db.query.teamDocument.findMany({
//     where: eq(teamDocument.teamId, teamId),
//   });

//   const buktiPembayaranDocument = documents.find(
//     (d) => d.type === 'bukti-pembayaran',
//   );

//   return !!buktiPembayaranDocument;
// };

export const isAllEventDocumentsPresent = async (
  db: Database,
  teamId: string,
  teamMembers: EventTeamMember[],
) => {
  let present: boolean = true;
  const team = await getEventTeamById(db, teamId, { teamMember: true });

  if (!team) return false;

  // present =
  //   present && !(await isTeamDocumentsPresent(db, teamId)) ? false : present;
  for (const member of teamMembers) {
    present =
      present && !(await isUserDocumentsPresent(db, member.userId))
        ? false
        : present;
    present =
      present &&
      !(await isEventTeamMemberDocumentsPresent(db, teamId, member.userId))
        ? false
        : present;
    if (!present) break;
  }

  return present;
};

export const getEventVerdict = async (
  db: Database,
  teamId: string,
  teamMembers: EventTeamMember[],
) => {
  let verdict = true;
  let errorCount = 0;

  // const td = await getAllEventTeamDocuments(db, teamId);

  // verdict = verdict && !td.buktiPembayaran?.isVerified ? false : verdict;
  // errorCount += Number(!!td.buktiPembayaran?.verificationError);
  for (const member of teamMembers) {
    const ud = await getAllUserDocuments(db, member.userId);
    verdict = verdict && !ud.kartuIdentitas?.isVerified ? false : verdict;
    errorCount += Number(!!ud.kartuIdentitas?.verificationError);

    const tdm = await getAllEventTeamMemberDocuments(db, member.userId, teamId);
    verdict =
      verdict && (!tdm.poster?.isVerified || !tdm.twibbon?.isVerified)
        ? false
        : verdict;
    errorCount +=
      Number(!!tdm.poster?.verificationError) +
      Number(!!tdm.twibbon?.verificationError);

    if (!verdict) break;
  }

  return { verdict, errorCount };
};

export const inferEventVerificationStatus = async (
  db: Database,
  teamId: string,
  admin: boolean = false,
): Promise<EventTeamVerificationStatusEnum> => {
  const team = await getEventTeamById(db, teamId, { teamMember: true });
  if (!team) return 'INCOMPLETE';
  if (!(await isAllEventDocumentsPresent(db, teamId, team.teamMembers)))
    return 'INCOMPLETE';
  if (!admin) return 'WAITING';
  if (await getEventVerdict(db, teamId, team.teamMembers)) return 'VERIFIED';
  return 'DENIED';
};

export const updateEventTeamStatus = async (
  db: Database,
  teamId: string,
  eventId: string,
  preeliminaryStatus?: EventTeamPreeliminaryStatusEnum,
  finalStatus?: EventTeamFinalStatusEnum,
) => {
  // Get existing team
  const team = await getEventTeamById(db, teamId);
  if (!team) {
    throw new Error('Team not found');
  }

  // Validate team belongs to event
  if (team.eventId !== eventId) {
    throw new Error('Team does not belong to this event');
  }

  const updateValues: {
    preeliminaryStatus?: EventTeamPreeliminaryStatusEnum;
    finalStatus?: EventTeamFinalStatusEnum;
  } = {};

  if (preeliminaryStatus) {
    updateValues.preeliminaryStatus = preeliminaryStatus;
  }

  if (finalStatus) {
    updateValues.finalStatus = finalStatus;
  }

  // Update team status
  return await db
    .update(eventTeam)
    .set(updateValues)
    .where(eq(eventTeam.id, teamId))
    .returning()
    .then(firstSure);
};
