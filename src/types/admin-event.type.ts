import { z } from 'zod';
import {
  eventStageEnum,
  eventTeamFinalStatusEnum,
  eventTeamPreeliminaryStatusEnum,
  teamVerificationStatusEnum,
} from '~/db/schema';

import { ListEventSubmissionRequirementSchema } from './event-team.type';
import { EventTeamSchema } from './event-team.type';

export const EventTeamsPaginatedSchema = z.object({
  pagination: z.object({
    currentPage: z.number(),
    totalItems: z.number(),
    totalPages: z.number(),
    next: z.string().url().nullable(),
    prev: z.string().url().nullable(),
  }),
  result: z.array(EventTeamSchema),
});

export const AdminAllEventTeamQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
  verifStatus: z
    .enum(teamVerificationStatusEnum.enumValues)
    .optional()
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
  prelimStatus: z
    .enum(eventTeamPreeliminaryStatusEnum.enumValues)
    .optional()
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
  finalStatus: z
    .enum(eventTeamFinalStatusEnum.enumValues)
    .optional()
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
  stage: z
    .enum(eventStageEnum.enumValues)
    .optional()
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
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

export const EventAndTeamIdParam = z.object({
  eventId: z.string().openapi({
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

export const EventAndTeamIdAndSubmissionIdParam = EventAndTeamIdParam.merge(
  z.object({
    typeId: z.string().openapi({
      param: {
        in: 'path',
        required: true,
      },
    }),
  }),
);
export const GroupedEventTeamSubmissionSchema = z.object({
  'pre-eliminary': ListEventSubmissionRequirementSchema.optional(),
  final: ListEventSubmissionRequirementSchema.optional(),
});
