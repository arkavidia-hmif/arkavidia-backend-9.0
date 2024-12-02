import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId, getNow } from '../../utils/drizzle-schema-util';
import { user } from './user.schema';
import { competition } from './competition.schema';
import { team } from './team.schema';

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
}));
