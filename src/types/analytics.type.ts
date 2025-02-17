import { z } from 'zod';

import { EventSchema } from './event.type';

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

const StageCompetitionStatisticSchema = z.object({
  preeliminary: z.number(),
  final: z.number(),
});

const VerificationStatusStatisticSchema = z.object({
  incomplete: z.number(),
  waiting: z.number(),
  onReview: z.number(),
  denied: z.number(),
  changed: z.number(),
  verified: z.number(),
});

const SingleCompetitionStatisticSchema = z.object({
  count: z.number(),
  verificationStatus: VerificationStatusStatisticSchema,
  stage: StageCompetitionStatisticSchema,
});

export const CompetitionStatisticSchema = z
  .object({
    competition: z.object({
      competitiveProgramming: SingleCompetitionStatisticSchema,
      captureTheFlag: SingleCompetitionStatisticSchema,
      arkalogica: SingleCompetitionStatisticSchema,
      datavidia: SingleCompetitionStatisticSchema,
      hackvidia: SingleCompetitionStatisticSchema,
      uxvidia: SingleCompetitionStatisticSchema,
    }),
  })
  .merge(SingleCompetitionStatisticSchema);

const SingleAcademyaStatisticSchema = z.object({
  count: z.number(),
  verificationStatus: VerificationStatusStatisticSchema,
  stage: StageCompetitionStatisticSchema,
});

export const AcademyaStatisticSchema = z
  .object({
    academya: z.object({
      softwareEngineering: SingleAcademyaStatisticSchema,
      dataScinece: SingleAcademyaStatisticSchema,
      uiux: SingleAcademyaStatisticSchema,
      productManagement: SingleAcademyaStatisticSchema,
    }),
  })
  .merge(SingleAcademyaStatisticSchema);

export const EventSubmissionStatistic = z.array(
  z.object({
    event: EventSchema,
    totalSubmission: z.number(),
  }),
);
