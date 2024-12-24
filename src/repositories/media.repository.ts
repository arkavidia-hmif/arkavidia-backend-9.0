import type { Database } from '~/db/drizzle';
import { media } from '~/db/schema';

const parseUrl = (url: string, creatorId: string) => ({
  creatorId,
  name: url.split('/').at(-1) as string,
  bucket: url.split('/').at(-2) as string,
  type: url.split('/').at(-1) as string,
  url,
});

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
