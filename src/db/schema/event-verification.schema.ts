import { relations } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  pgEnum,
  pgTable,
  primaryKey,
  text,
} from 'drizzle-orm/pg-core';

import { eventTeamMember } from './event-team-member.schema';
import { eventTeam } from './event-team.schema';
import { media } from './media.schema';

export const eventTeamMemberDocumentTypeEnum = pgEnum(
  'event_team_member_document_type_enum',
  ['poster', 'twibbon'],
);

export const eventTeamMemberDocument = pgTable(
  'event_team_member_document',
  {
    teamId: text('team_id').notNull(),
    userId: text('user_id').notNull(),
    type: eventTeamMemberDocumentTypeEnum('type').notNull(),
    mediaId: text('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    isVerified: boolean('is_verified').notNull().default(false),
    verificationError: text('verification_error'),
  },
  (t) => ({
    pk: primaryKey(t.teamId, t.userId, t.type),
    fk: foreignKey({
      columns: [t.teamId, t.userId],
      foreignColumns: [eventTeamMember.teamId, eventTeamMember.userId],
    }),
  }),
);

export const eventTeamMemberDocumentRelations = relations(
  eventTeamMemberDocument,
  ({ one }) => ({
    eventTeamMember: one(eventTeamMember, {
      fields: [eventTeamMemberDocument.teamId, eventTeamMemberDocument.userId],
      references: [eventTeamMember.teamId, eventTeamMember.userId],
    }),
    media: one(media, {
      fields: [eventTeamMemberDocument.mediaId],
      references: [media.id],
    }),
  }),
);

export type TeamMemberDocumentTypeEnum =
  (typeof eventTeamMemberDocumentTypeEnum.enumValues)[number];

export const eventTeamDocumentTypeEnum = pgEnum(
  'event_team_document_type_enum',
  ['submisi-awal'],
);

export const eventTeamDocument = pgTable(
  'event_team_document',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => eventTeam.id, { onDelete: 'cascade' }),
    type: eventTeamDocumentTypeEnum('type').notNull(),
    mediaId: text('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    isVerified: boolean('is_verified').notNull().default(false),
    verificationError: text('verification_error'),
  },
  (t) => ({
    pk: primaryKey(t.teamId, t.type),
  }),
);

export const eventTeamDocumentRelations = relations(
  eventTeamDocument,
  ({ one }) => ({
    team: one(eventTeam, {
      fields: [eventTeamDocument.teamId],
      references: [eventTeam.id],
    }),
    media: one(media, {
      fields: [eventTeamDocument.mediaId],
      references: [media.id],
    }),
  }),
);

export type EventTeamDocumentTypeEnum =
  (typeof eventTeamDocumentTypeEnum.enumValues)[number];
