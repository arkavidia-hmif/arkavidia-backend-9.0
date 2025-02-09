import { InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { eventTeam } from './event-team.schema';
import { eventTeamMemberDocument } from './event-verification.schema';
import { teamMemberRoleEnum } from './team-member.schema';
import { user } from './user.schema';

export const eventTeamMember = pgTable(
  'event_team_member',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    teamId: text('team_id')
      .notNull()
      .references(() => eventTeam.id, { onDelete: 'cascade' }),
    role: teamMemberRoleEnum('role').notNull(),
  },
  (t) => ({
    pk: primaryKey(t.userId, t.teamId),
  }),
);

export const eventTeamMemberRelations = relations(
  eventTeamMember,
  ({ one, many }) => ({
    user: one(user, {
      fields: [eventTeamMember.userId],
      references: [user.id],
    }),
    team: one(eventTeam, {
      fields: [eventTeamMember.teamId],
      references: [eventTeam.id],
    }),
    document: many(eventTeamMemberDocument),
  }),
);

export type EventTeamMember = InferSelectModel<typeof eventTeamMember>;
