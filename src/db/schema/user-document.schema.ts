import { relations } from 'drizzle-orm';
import {
	pgEnum,
	pgTable,
	primaryKey,
	text,
} from 'drizzle-orm/pg-core';
import { user } from './user.schema';
import { media } from './media.schema';

export const userDocumentTypeEnum = pgEnum('user_document_type_enum', [
	'nisn',
	'ktm',
	'kartu_pelajar',
]);

export const userDocument = pgTable(
	'user_document',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		mediaId: text('media_id')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),
		type: userDocumentTypeEnum('type').notNull(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.type] }),
	}),
);

export const userDocumentRelations = relations(userDocument, ({ one }) => ({
	user: one(user, {
		fields: [userDocument.userId],
		references: [user.id],
	}),
	media: one(media, {
		fields: [userDocument.mediaId],
		references: [media.id],
	}),
}));
