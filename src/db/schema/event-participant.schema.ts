import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';
import { user } from './user.schema';
import { media } from './media.schema';
import { event } from './event.schema';

export const eventParticipant = pgTable(
	'event_participant',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		eventId: text('event_id')
			.notNull()
			.references(() => event.id, { onDelete: 'cascade' }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.eventId] }),
	}),
);

export const eventParticipantRelations = relations(
	eventParticipant,
	({ one }) => ({
		user: one(user, {
			fields: [eventParticipant.userId],
			references: [user.id],
		}),
		event: one(event, {
			fields: [eventParticipant.eventId],
			references: [event.id],
		}),
	}),
);
