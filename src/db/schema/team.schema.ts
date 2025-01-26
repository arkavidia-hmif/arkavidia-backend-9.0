import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { createId, getNow } from '../../utils/drizzle-schema-util';
import {
  competition,
  competitionSubmission,
  stageEnum,
} from './competition.schema';
import { teamMember } from './team-member.schema';
import { teamDocument } from './verification.schema';

export const teamVerificationStatusEnum = pgEnum(
  'team_verification_status_enum',
  ['VERIFIED', 'DENIED', 'WAITING', 'CHANGED'],
);

export const team = pgTable('team', {
  id: text('id').primaryKey().$defaultFn(createId),
  competitionId: text('competition_id')
    .notNull()
    .references(() => competition.id, { onDelete: 'cascade' }),
  name: text('team_name').notNull(),
  stage: stageEnum('stage').notNull().default('pre-eliminary'),
  verificationStatus: teamVerificationStatusEnum('verification_status'),
  joinCode: text('team_code').notNull().$defaultFn(createId).unique(),
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

export type TeamVerificationStatusEnum =
  (typeof teamVerificationStatusEnum.enumValues)[number];
