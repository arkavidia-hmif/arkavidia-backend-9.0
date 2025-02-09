import { eq } from 'drizzle-orm';
import type { Database } from '~/db/drizzle';
import {
  competitionSubmission,
  eventSubmission,
  eventTeamDocument,
  media,
  teamDocument,
} from '~/db/schema';

const parseUrl = (url: string, creatorId: string) => ({
  creatorId,
  name: url.split('/').at(-1) as string,
  bucket: url.split('/').at(-2) as string,
  type: url.split('/').at(-1) as string,
  url,
});

export const getMediaByUrl = async (db: Database, url: string) => {
  return await db.query.media.findFirst({
    where: eq(media.url, url),
  });
};

export const findMediaInTables = async (db: Database, id: string) => {
  const competitionTeamDoc = await db.query.teamDocument.findFirst({
    where: eq(teamDocument.mediaId, id),
    with: {
      team: {
        with: {
          teamMembers: true,
        },
      },
    },
  });
  const eventTeamDoc = await db.query.eventTeamDocument.findFirst({
    where: eq(eventTeamDocument.mediaId, id),
    with: {
      team: {
        with: {
          teamMembers: true,
        },
      },
    },
  });

  const competitionTeamSubmission =
    await db.query.competitionSubmission.findFirst({
      where: eq(competitionSubmission.mediaId, id),
      with: {
        team: {
          with: {
            teamMembers: true,
          },
        },
      },
    });
  const eventTeamSubmission = await db.query.eventSubmission.findFirst({
    where: eq(eventSubmission.mediaId, id),
    with: {
      team: {
        with: {
          teamMembers: true,
        },
      },
    },
  });

  return {
    competitionTeamDoc,
    eventTeamDoc,
    competitionTeamSubmission,
    eventTeamSubmission,
  };
};

export const insertMediaFromUrl = async (
  db: Database,
  creatorId: string,
  url: string | string[],
) => {
  const values =
    typeof url === 'string'
      ? [parseUrl(url, creatorId)]
      : url.map((el) => parseUrl(el, creatorId));
  return await db.insert(media).values(values).returning();
};

/* eslint-disable */
export const deleteMedia = async (db: Database, id: string) => {};
