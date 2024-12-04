import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	json,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core';
import { createId, getNow } from '../../utils/drizzle-schema-util';
import { todo } from './todo.schema';

export const user = pgTable('user', {
	id: text('id').primaryKey().$defaultFn(createId),
	name: text('name').notNull(),
	age: integer('age').notNull().default(0),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const userRelation = relations(user, ({ one, many }) => ({
	todo: many(todo),
}));
