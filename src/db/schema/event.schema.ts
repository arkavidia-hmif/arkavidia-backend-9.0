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
import { eventTeam } from './event-team.schema';
import { media } from './media.schema';
import { user } from './user.schema';

/** Enum */
export const eventStageEnum = pgEnum('phase_enum', ['pre-eliminary', 'final']);

/** Main Compeitition Table */
export const event = pgTable('event', {
  id: text('id').primaryKey().$defaultFn(createId),
  title: text('title').notNull().notNull(),
  description: text('description').notNull(),
  maxParticipants: integer('max_participants').notNull(),
  maxTeamMember: integer('max_team_member').notNull(),
  guidebookUrl: text('guide_book_url'),
});

export const eventRelations = relations(event, ({ many }) => ({
  team: many(eventTeam),
  announcement: many(eventAnnouncement),
  timeline: many(eventTimeline),
}));

/** event Announcements Table */
export const eventAnnouncement = pgTable('event_announcement', {
  id: text('id').primaryKey().$defaultFn(createId),
  eventId: text('event_id')
    .notNull()
    .references(() => event.id),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id),
  title: text('title').notNull().notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').$onUpdate(getNow),
});

export const eventAnnouncementRelations = relations(
  eventAnnouncement,
  ({ one }) => ({
    event: one(event, {
      fields: [eventAnnouncement.eventId],
      references: [event.id],
    }),
    author: one(user, {
      fields: [eventAnnouncement.authorId],
      references: [user.id],
    }),
  }),
);

/** event Submission File Type **/

export const eventSubmissionRequirement = pgTable(
  'event_submission_requirement',
  {
    typeId: text('type_id').primaryKey().$defaultFn(createId),
    eventId: text('event_id')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade' }),
    mediaId: text('media_id').references(() => media.id, {
      onDelete: 'set null',
    }),
    stage: eventStageEnum('stage').notNull().default('pre-eliminary'),
    order: integer('order').notNull().default(-1),
    typeName: text('type_name').notNull(),
    description: text('description').notNull(),
    startDate: timestamp('start_date').notNull(),
    deadline: timestamp('deadline'),
  },
);

export const eventSubmissionRequirementRelations = relations(
  eventSubmissionRequirement,
  ({ one, many }) => ({
    submissions: many(eventSubmission),
    media: one(media, {
      fields: [eventSubmissionRequirement.mediaId],
      references: [media.id],
    }),
  }),
);

export const eventSubmission = pgTable(
  'event_submission',
  {
    teamId: text('team_id')
      .notNull()
      .references(() => eventTeam.id, { onDelete: 'cascade' }),
    typeId: text('type_id')
      .notNull()
      .references(() => eventSubmissionRequirement.typeId, {
        onDelete: 'cascade',
      }),
    mediaId: text('media_id').references(() => media.id, {
      onDelete: 'set null',
    }),
    judgeResponse: text('judge_response'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdate(getNow),
  },
  (t) => ({
    pk: primaryKey(t.teamId, t.typeId),
  }),
);

export const eventSubmissionRelations = relations(
  eventSubmission,
  ({ one }) => ({
    team: one(eventTeam, {
      fields: [eventSubmission.teamId],
      references: [eventTeam.id],
    }),
    media: one(media, {
      fields: [eventSubmission.mediaId],
      references: [media.id],
    }),
    requirement: one(eventSubmissionRequirement, {
      fields: [eventSubmission.typeId],
      references: [eventSubmissionRequirement.typeId],
    }),
  }),
);

/** event Timeline Table */
export const eventTimeline = pgTable('event_timeline', {
  id: text('id').primaryKey().$defaultFn(createId),
  eventId: text('event_id')
    .notNull()
    .references(() => event.id),
  title: text('title').notNull().notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  showOnLanding: boolean('show_on_landing').notNull().default(false),
  showTime: boolean('show_tile').notNull().default(false),
});

export const eventTimelineRelations = relations(eventTimeline, ({ one }) => ({
  event: one(event, {
    fields: [eventTimeline.eventId],
    references: [event.id],
  }),
}));

export type EventStageEnum = (typeof eventStageEnum.enumValues)[number];
