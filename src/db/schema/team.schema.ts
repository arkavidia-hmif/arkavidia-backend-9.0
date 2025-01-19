import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { createId, getNow } from '../../utils/drizzle-schema-util';
import { competition, competitionSubmission } from './competition.schema';
import { teamMember } from './team-member.schema';
import { teamDocument } from './verification.schema';

export const team = pgTable('team', {
  id: text('id').primaryKey().$defaultFn(createId),
  competitionId: text('competition_id')
    .notNull()
    .references(() => competition.id, { onDelete: 'cascade' }), // Add reference to competition
  name: text('team_name').notNull(),
  joinCode: text('team_code').notNull().$defaultFn(createId).unique(), // Add unique constraint
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const teamRelations = relations(team, ({ one, many }) => ({
  teamMembers: many(teamMember),
  competition: one(competition, {
    fields: [team.competitionId],
    references: [competition.id],
  }),
  document: many(teamDocument),
  submission: many(competitionSubmission),
}));
