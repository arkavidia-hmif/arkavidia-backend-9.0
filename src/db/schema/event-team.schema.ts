import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { createId, getNow } from '../../utils/drizzle-schema-util';
import { eventTeamMember } from './event-team-member.schema';
import { eventTeamDocument } from './event-verification.schema';
import { event, eventStageEnum, eventSubmission } from './event.schema';
import { teamVerificationStatusEnum } from './team.schema';

export const eventTeamPreeliminaryStatusEnum = pgEnum(
  'event_team_preeliminary_status_enum',
  ['On Review', 'Pass', 'Not Pass'],
);
export const eventTeamFinalStatusEnum = pgEnum('event_team_final_status_enum', [
  'On Review',
  'Not Pass',
  'Juara 1',
  'Juara 2',
  'Juara 3',
]);

export const eventTeam = pgTable('event_team', {
  id: text('id').primaryKey().$defaultFn(createId),
  eventId: text('event_id')
    .notNull()
    .references(() => event.id, { onDelete: 'cascade' }),
  name: text('team_name').notNull(),
  stage: eventStageEnum('stage').notNull().default('pre-eliminary'),
  verificationStatus: teamVerificationStatusEnum('verification_status').default(
    'INCOMPLETE',
  ),
  preeliminaryStatus: eventTeamPreeliminaryStatusEnum('preeliminary_status')
    .notNull()
    .default('On Review'),
  finalStatus: eventTeamFinalStatusEnum('final_status')
    .notNull()
    .default('On Review'),
  joinCode: text('team_code').notNull().$defaultFn(createId).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const eventTeamRelations = relations(eventTeam, ({ one, many }) => ({
  teamMembers: many(eventTeamMember),
  event: one(event, {
    fields: [eventTeam.eventId],
    references: [event.id],
  }),
  document: many(eventTeamDocument),
  submission: many(eventSubmission),
}));

export type EventTeamVerificationStatusEnum =
  (typeof teamVerificationStatusEnum.enumValues)[number];

export type EventTeamPreeliminaryStatusEnum =
  (typeof eventTeamPreeliminaryStatusEnum.enumValues)[number];

export type EventTeamFinalStatusEnum =
  (typeof eventTeamFinalStatusEnum.enumValues)[number];
