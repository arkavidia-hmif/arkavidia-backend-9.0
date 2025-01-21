import { relations } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  pgEnum,
  pgTable,
  primaryKey,
  text,
} from 'drizzle-orm/pg-core';

import { media } from './media.schema';
import { teamMember } from './team-member.schema';
import { team } from './team.schema';
import { user } from './user.schema';

export const userDocumentTypeEnum = pgEnum('user_document_type_enum', [
  'nisn',
  'kartu-identitas',
]);

export const userDocument = pgTable(
  'user_document',
  {
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: userDocumentTypeEnum('type').notNull(),
    mediaId: text('media_id')
      .notNull()
      .references(() => media.id, { onDelete: 'cascade' }),
    isVerified: boolean('is_verified').notNull().default(false),
    verificationError: text('verification_error'),
  },
  (t) => ({
    pk: primaryKey(t.userId, t.type),
  }),
);

export const userDocumentRelations = relations(userDocument, ({ one }) => ({
  user: one(user, {
    fields: [userDocument.userId],
    references: [user.id],
  }),
  media: one(media, {
    fields: [userDocument.mediaId],
    references: [media.id],
  }),
}));

export type UserDocumentTypeEnum =
  (typeof userDocumentTypeEnum.enumValues)[number];

export const teamMemberDocumentTypeEnum = pgEnum(
  'team_member_document_type_enum',
  ['poster', 'twibbon'],
);

export const teamMemberDocument = pgTable(
  'team_member_document',
  {
    teamId: text('team_id').notNull(),
    userId: text('user_id').notNull(),
    type: teamMemberDocumentTypeEnum('type').notNull(),
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
      foreignColumns: [teamMember.teamId, teamMember.userId],
    }),
  }),
);

export const teamMemberDocumentRelations = relations(
  teamMemberDocument,
  ({ one }) => ({
    teamMember: one(teamMember, {
      fields: [teamMemberDocument.teamId, teamMemberDocument.userId],
      references: [teamMember.teamId, teamMember.userId],
    }),
    media: one(media, {
      fields: [teamMemberDocument.mediaId],
      references: [media.id],
    }),
  }),
);

export type TeamMemberDocumentTypeEnum =
  (typeof teamMemberDocumentTypeEnum.enumValues)[number];

export const teamDocumentTypeEnum = pgEnum('team_document_type_enum', [
  'bukti-pembayaran',
]);

export const teamDocument = pgTable(
  'team_document',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    type: teamDocumentTypeEnum('type').notNull(),
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

export const teamDocumentRelations = relations(teamDocument, ({ one }) => ({
  team: one(team, {
    fields: [teamDocument.teamId],
    references: [team.id],
  }),
  media: one(media, {
    fields: [teamDocument.mediaId],
    references: [media.id],
  }),
}));

export type TeamDocumentTypeEnum =
  (typeof teamDocumentTypeEnum.enumValues)[number];
