import { z } from 'zod';

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
