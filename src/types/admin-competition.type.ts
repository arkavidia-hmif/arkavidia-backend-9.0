import { z } from 'zod';

import { ListSubmissionRequirementSchema, TeamSchema } from './team.type';

export const CompetitionAndTeamIdParam = z.object({
  competitionId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
  teamId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const PaginationQuerySchema = z.object({
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

export const TeamsPaginatedSchema = z.object({
  pagination: z.object({
    currentPage: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    next: z.string().url().nullable(),
    prev: z.string().url().nullable(),
  }),
  result: z.array(TeamSchema),
});

const SingleVerificationSchema = z.object({
  isVerified: z.boolean(),
  verificationError: z.string().optional(),
});

export const PutTeamVerificationBodySchema = z.object({
  buktiPembayaran: SingleVerificationSchema.optional(),
  teamMember: z.array(
    z
      .object({
        userId: z.string(),
        kartuIdentitas: SingleVerificationSchema.optional(),
        poster: SingleVerificationSchema.optional(),
        twibbon: SingleVerificationSchema.optional(),
      })
      .optional(),
  ),
});

export const GroupedTeamSubmissionSchmea = z.object({
  'pre-eliminary': ListSubmissionRequirementSchema.optional(),
  final: ListSubmissionRequirementSchema.optional(),
});
