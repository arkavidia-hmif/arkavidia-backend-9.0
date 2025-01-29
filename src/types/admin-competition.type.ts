import { z } from 'zod';
import {
  competitionTeamFinalStatusEnum,
  competitionTeamPreeliminaryStatusEnum,
} from '~/db/schema';

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

export const CompetitionAndTeamIdAndSubmissionIdParam =
  CompetitionAndTeamIdParam.merge(
    z.object({
      typeId: z.string().openapi({
        param: {
          in: 'path',
          required: true,
        },
      }),
    }),
  );

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

export const PutCompetitionTeamStatusSchema = z.object({
  preeliminaryStatus: z
    .enum(competitionTeamPreeliminaryStatusEnum.enumValues)
    .optional(),
  finalStatus: z.enum(competitionTeamFinalStatusEnum.enumValues).optional(),
});

export const PutTeamSubmissionVerdictSchema = z.object({
  judgeResponse: z.string().min(1, 'Judgement must be at least 1 character.'),
});
