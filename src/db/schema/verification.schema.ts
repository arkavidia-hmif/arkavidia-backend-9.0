import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

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
      .references(() => user.id),
    type: userDocumentTypeEnum('type').notNull(),
    mediaId: text('media_id')
      .notNull()
      .references(() => media.id),
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

export const teamMemberDocumentTypeEnum = pgEnum(
  'team_member_document_type_enum',
  ['poster', 'twibbon'],
);

export const teamMemberDocument = pgTable(
  'team_member_document',
  {
    teamMemberId: text('team_member_id')
      .notNull()
      .references(() => teamMember.id),
    type: teamMemberDocumentTypeEnum('type').notNull(),
    mediaId: text('media_id')
      .notNull()
      .references(() => media.id),
  },
  (t) => ({
    pk: primaryKey(t.teamMemberId, t.type),
  }),
);

export const teamMemberDocumentRelations = relations(
  teamMemberDocument,
  ({ one }) => ({
    teamMember: one(user, {
      fields: [teamMemberDocument.teamMemberId],
      references: [user.id],
    }),
    media: one(media, {
      fields: [teamMemberDocument.mediaId],
      references: [media.id],
    }),
  }),
);

export const teamDocumentTypeEnum = pgEnum('team_document_type_enum', [
  'bukti-pembayaran',
]);

export const teamDocument = pgTable(
  'team_document',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => team.id),
    type: teamDocumentTypeEnum('type').notNull(),
    mediaId: text('media_id')
      .notNull()
      .references(() => media.id),
  },
  (t) => ({
    pk: primaryKey(t.teamId, t.type),
  }),
);

export const teamDocumentRelations = relations(teamDocument, ({ one }) => ({
  team: one(user, {
    fields: [teamDocument.teamId],
    references: [user.id],
  }),
  media: one(media, {
    fields: [teamDocument.mediaId],
    references: [media.id],
  }),
}));
