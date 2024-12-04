import { relations } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId, getNow } from '../../utils/drizzle-schema-util';
import { competition } from './competition.schema';
import { media } from './media.schema';
import { team } from './team.schema';
import { user } from './user.schema';

export const teamMemberRoleEnum = pgEnum('team_member_role_renum', [
	'leader',
	'member',
]);

export const teamMember = pgTable('team_member', {
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	teamId: text('team_id')
		.notNull()
		.references(() => team.id, { onDelete: 'cascade' }),
	role: teamMemberRoleEnum('role').notNull(),
	nisnMediaId: text('nisn_media_id').references(() => media.id, {
		onDelete: 'cascade',
	}),
	kartuMediaId: text('kartu_media_id').references(() => media.id, {
		// bisa KTM or Kartu Pelajar
		onDelete: 'cascade',
	}),
	posterMediaId: text('poster_media_id').references(() => media.id, {
		onDelete: 'cascade',
	}),
	twibbonMediaId: text('twibbon_media_id').references(() => media.id, {
		onDelete: 'cascade',
	}),

	isVerified: boolean('is_verified').default(false).notNull(),
	verificationError: text('verification_error'),
});

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
	user: one(user, {
		fields: [teamMember.userId],
		references: [user.id],
	}),
	team: one(team, {
		fields: [teamMember.teamId],
		references: [team.id],
	}),
	nisn: one(media, {
		fields: [teamMember.nisnMediaId],
		references: [media.id],
	}),
	kartu: one(media, {
		fields: [teamMember.kartuMediaId],
		references: [media.id],
	}),
	poster: one(media, {
		fields: [teamMember.posterMediaId],
		references: [media.id],
	}),
	twibbon: one(media, {
		fields: [teamMember.twibbonMediaId],
		references: [media.id],
	}),
}));
