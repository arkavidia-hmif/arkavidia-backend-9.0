import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '../../utils/drizzle-schema-util';
import { user } from './user.schema';

export const mediaBucketEnum = pgEnum('media_bucket_enum', [
  'competition-registration',
]);

export const media = pgTable('media', {
  id: text('id').primaryKey().$defaultFn(createId),
  creatorId: text('creator_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').unique().notNull(),
  bucket: text('bucket').notNull(),
  type: text('type').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});
