import { z } from 'zod';

import { ListEventSubmissionRequirementSchema } from './event-team.type';

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

export const GroupedEventTeamSubmissionSchema = z.object({
  'pre-eliminary': ListEventSubmissionRequirementSchema.optional(),
  final: ListEventSubmissionRequirementSchema.optional(),
});
