import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  competition,
  competitionAnnouncement,
  competitionTimeline,
} from '~/db/schema';
import { TeamSchema, TeamSubmissionSchema } from '~/types/team.type';

export const CompetitionSchema =
  createSelectSchema(competition).openapi('Competition');

export const GetCompetitionSubmissionQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
  limit: z
    .string()
    .default('10')
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
});

export const AnnouncementSchema = createSelectSchema(competitionAnnouncement, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('Announcement');

export const AllAnnouncementSchema = z.array(AnnouncementSchema);

export const CompetitionIdParam = z.object({
  competitionId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const PostCompAnnouncementBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const CompetitionParticipantSchema = z
  .object({
    pagination: z.object({
      currentPage: z.number(),
      totalItems: z.number(),
      totalPages: z.number(),
      next: z.string().url().nullable(),
      prev: z.string().url().nullable(),
    }),
    result: z.array(TeamSchema),
  })
  .openapi('CompetitionParticipant');

export const GetCompetitionTimeQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
  limit: z
    .string()
    .default('10')
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
});

export const CompetitionSubmissionSchema = z
  .object({
    pagination: z.object({
      currentPage: z.number().min(1),
      totalItems: z.number().nonnegative(),
      totalPages: z.number().nonnegative(),
      next: z.string().url().nullable(),
      prev: z.string().url().nullable(),
    }),
    result: z.array(TeamSubmissionSchema).min(1),
  })
  .openapi('CompetitionSubmission');

export const CompetitionTimelineSchema = z.array(
  createSelectSchema(competitionTimeline).openapi('CompetitionTimeline'),
);

export const FeedbackSubmissionBodySchema = z.object({
  feedback: z.string().min(1),
});

export const TeamAndTypeIdParam = z.object({
  teamId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
  typeId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const CompetitionNameQuery = z.object({
  name: z
    .string()
    .optional()
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
});

export const CompetitionIdShema = z.object({
  name: z.string(),
  id: z.string(),
});
