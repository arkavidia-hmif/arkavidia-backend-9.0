import { InferSelectModel, relations } from 'drizzle-orm';
import { pgEnum, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { team } from './team.schema';
import { user } from './user.schema';
import { teamMemberDocument } from './verification.schema';

export const teamMemberRoleEnum = pgEnum('team_member_role_enum', [
  'leader',
  'member',
]);

export const teamMember = pgTable(
  'team_member',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    teamId: text('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    role: teamMemberRoleEnum('role').notNull(),
  },
  (t) => ({
    pk: primaryKey(t.userId, t.teamId),
  }),
);

export const teamMemberRelations = relations(teamMember, ({ one, many }) => ({
  user: one(user, {
    fields: [teamMember.userId],
    references: [user.id],
  }),
  team: one(team, {
    fields: [teamMember.teamId],
    references: [team.id],
  }),
  document: many(teamMemberDocument),
}));

export type TeamMember = InferSelectModel<typeof teamMember>;
