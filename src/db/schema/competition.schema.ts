import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { createId, getNow } from '../../utils/drizzle-schema-util';
import { media } from './media.schema';
import { team } from './team.schema';
import { user } from './user.schema';

/** Enum */
export const stageEnum = pgEnum('phase_enum', [
  'pre-eliminary',
  'final',
  'verification',
]);

export const submissionStatusEnum = pgEnum('submission_status_enum', [
  'pending',
  'under_review',
  'approved',
]);

/** Main Compeitition Table */
export const competition = pgTable('competition', {
  id: text('id').primaryKey().$defaultFn(createId),
  title: text('title').notNull().notNull(),
  description: text('description').notNull(),
  maxParticipants: integer('max_participants').notNull(),
  maxTeamMember: integer('max_team_member').notNull(),
  guidebookUrl: text('guide_book_url'),
});

export const competitionRelations = relations(competition, ({ many }) => ({
  team: many(team),
  announcement: many(competitionAnnouncement),
  timeline: many(competitionTimeline),
}));

/** Competition Announcements Table */
export const competitionAnnouncement = pgTable('competition_announcement', {
  id: text('id').primaryKey().$defaultFn(createId),
  competitionId: text('competition_id')
    .notNull()
    .references(() => competition.id),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id),
  title: text('title').notNull().notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const competitionAnnouncementRelations = relations(
  competitionAnnouncement,
  ({ one }) => ({
    competition: one(competition, {
      fields: [competitionAnnouncement.competitionId],
      references: [competition.id],
    }),
    author: one(user, {
      fields: [competitionAnnouncement.authorId],
      references: [user.id],
    }),
  }),
);

/** Competition Submission File Type **/

export const competitionSubmissionRequirement = pgTable(
  'competition_submission_requirement',
  {
    typeId: text('type_id').primaryKey().$defaultFn(createId),
    competitionId: text('competition_id')
      .notNull()
      .references(() => competition.id),
    stage: stageEnum('stage').notNull().default('pre-eliminary'),
    order: integer('order').notNull().default(-1),
    typeName: text('type_name').notNull(),
    description: text('description').notNull(),
    startDate: timestamp('start_date').notNull(),
    deadline: timestamp('deadline'),
  },
);

/** Competition Submissions Table ( not used anymore, changed by competition_submission_requirement)
export const competitionSubmissionTypeEnum = pgEnum(
  'competition_submission_type_enum',
  ['uiux_poster'],
); **/

export const competitionSubmission = pgTable(
  'competition_submission',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    typeId: text('type_id')
      .notNull()
      .references(() => competitionSubmissionRequirement.typeId, {
        onDelete: 'cascade',
      }),
    mediaId: text('media_id').references(() => media.id, {
      onDelete: 'set null',
    }),
    judgeResponse: text('judge_response'),
    status: submissionStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdate(getNow),
  },
  (t) => ({
    pk: primaryKey(t.teamId, t.typeId),
  }),
);

export const competitionSubmissionRelations = relations(
  competitionSubmission,
  ({ one }) => ({
    team: one(team, {
      fields: [competitionSubmission.teamId],
      references: [team.id],
    }),
    media: one(media, {
      fields: [competitionSubmission.mediaId],
      references: [media.id],
    }),
    requirement: one(competitionSubmissionRequirement, {
      fields: [competitionSubmission.typeId],
      references: [competitionSubmissionRequirement.typeId],
    }),
  }),
);

export const competitionSubmissionRequirementRelations = relations(
  competitionSubmissionRequirement,
  ({ many }) => ({
    submissions: many(competitionSubmission),
  }),
);

/** Competition Timeline Table */
export const competitionTimeline = pgTable('competition_timeline', {
  id: text('id').primaryKey().$defaultFn(createId),
  competitionId: text('competition_id')
    .notNull()
    .references(() => competition.id),
  title: text('title').notNull().notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  showOnLanding: boolean('show_on_landing').notNull().default(false),
  showTime: boolean('show_tile').notNull().default(false),
});

export const competitionTimelineRelations = relations(
  competitionTimeline,
  ({ one }) => ({
    competition: one(competition, {
      fields: [competitionTimeline.competitionId],
      references: [competition.id],
    }),
  }),
);

export type CompetitionStageEnum = (typeof stageEnum.enumValues)[number];
