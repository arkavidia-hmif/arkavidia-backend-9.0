import { z } from 'zod';

export const OptionalServiceKeyParamSchema = z.object({
  key: z
    .string()
    .optional()
    .openapi({
      param: {
        in: 'path',
        required: true,
      },
    }),
});

const SingleUserStatisticSchema = z.object({
  totalCount: z.number(),
  totalRegisteredCount: z.number(),
  totalConsentCount: z.number(),
});

export const UserStatisticSchema = z
  .object({
    education: z.object({
      sma: SingleUserStatisticSchema.optional(),
      s1: SingleUserStatisticSchema.optional(),
      s2: SingleUserStatisticSchema.optional(),
    }),
  })
  .merge(SingleUserStatisticSchema);
