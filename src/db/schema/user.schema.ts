import { type InferSelectModel, relations } from 'drizzle-orm';
import {
	boolean,
	date,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';
import { getNow } from '../../utils/drizzle-schema-util';
import { userIdentity } from './auth.schema';
import { teamMember } from './team-member.schema';

export const userEducationEnum = pgEnum('user_education_enum', [
	's1',
	's2',
	'sma',
]);

export const user = pgTable('user', {
	id: text('id')
		.primaryKey()
		.references(() => userIdentity.id),
	email: text('email').notNull().unique(), // Add unique constraint
	fullName: text('full_name'),
	birthDate: date('birth_date'),
	education: userEducationEnum('education'),
	entrySource: text('entry_source'), // Ini semacam 'Where did you hear from us?',
	instance: text('instance'),
	phoneNumber: text('phone_number'),
	idLine: text('id_line'),
	idDiscord: text('id_discord'),
	idInstagram: text('id_instagram'),
	consent: boolean('consent').notNull().default(false),
	isRegistrationComplete: boolean('is_registration_complete')
		.notNull()
		.default(false),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const userRelations = relations(user, ({ one, many }) => ({
	userIdentity: one(userIdentity, {
		fields: [user.id],
		references: [userIdentity.id],
	}),
	teamMember: many(teamMember),
}));

export type User = InferSelectModel<typeof user>;
