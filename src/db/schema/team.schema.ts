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
import { voucer } from './voucer.schema';

export const teamVerificationStatusEnum = pgEnum(
  'team_verification_status_enum',
  ['INCOMPLETE', 'VERIFIED', 'DENIED', 'WAITING', 'CHANGED', 'ON REVIEW'],
);

export const competitionTeamPreeliminaryStatusEnum = pgEnum(
  'competition_team_preeliminary_status_enum',
  ['On Review', 'Pass', 'Not Pass'],
);
export const competitionTeamFinalStatusEnum = pgEnum(
  'competition_team_final_status_enum',
  ['On Review', 'Not Pass', 'Juara 1', 'Juara 2', 'Juara 3'],
);

export const team = pgTable('team', {
  id: text('id').primaryKey().$defaultFn(createId),
  competitionId: text('competition_id')
    .notNull()
    .references(() => competition.id, { onDelete: 'cascade' }),
  name: text('team_name').notNull(),
  stage: stageEnum('stage').notNull().default('pre-eliminary'),
  appliedVoucerId: text('applied_voucer_id').references(() => voucer.id, {
    onDelete: 'set null',
  }),
  verificationStatus: teamVerificationStatusEnum('verification_status').default(
    'INCOMPLETE',
  ),
  preeliminaryStatus: competitionTeamPreeliminaryStatusEnum(
    'preeliminary_status',
  )
    .notNull()
    .default('On Review'),
  finalStatus: competitionTeamFinalStatusEnum('final_status')
    .notNull()
    .default('On Review'),
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
  voucer: one(voucer, {
    fields: [team.appliedVoucerId],
    references: [voucer.id],
  }),
}));

export type CompetitionTeamVerificationStatusEnum =
  (typeof teamVerificationStatusEnum.enumValues)[number];

export type CompetitionTeamPreeliminaryStatusEnum =
  (typeof competitionTeamPreeliminaryStatusEnum.enumValues)[number];

export type CompetitionTeamFinalStatusEnum =
  (typeof competitionTeamFinalStatusEnum.enumValues)[number];
