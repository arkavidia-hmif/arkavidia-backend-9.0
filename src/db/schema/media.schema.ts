import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import {
	type AnyPgColumn,
	boolean,
	date,
	index,
	integer,
	json,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core';
import { createId, getNow } from '../../utils/drizzle-schema-util';
import { user } from './user.schema';
import { userDocument } from './user-document.schema';

export const media = pgTable('media', {
	id: text('id').primaryKey().$defaultFn(createId),
	creatorId: text('creator_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	name: text('name').unique().notNull(),
	type: text('type').notNull(),
	url: text('url').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const mediaRelations = relations(media, ({ many }) => ({
	userDocument: many(userDocument),
}));