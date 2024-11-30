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
import { userIdentity } from './auth.schema';

export const user = pgTable('user', {
	id: text('id')
		.primaryKey()
		.references(() => userIdentity.id),
	email: text('email').notNull(),
	birthDate: date('birth_date'),
	instance: text('instance'),
	phoneNumber: text('phone_number'),
});

export const userRelations = relations(user, ({ one }) => ({
	userIdentity: one(userIdentity, {
		fields: [user.id],
		references: [userIdentity.id],
	}),
}));
