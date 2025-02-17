import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import {
  competition,
  competitionSubmission,
  competitionSubmissionRequirement,
  team,
  teamDocument,
} from '~/db/schema';

import { MediaSchema } from './media.type';
import { TeamMemberSchema } from './team-member.type';
import { VoucerSchema } from './voucer.type';

export const TeamDocumentSchema = createSelectSchema(teamDocument)
  .merge(
    z.object({
      media: MediaSchema,
    }),
  )
  .openapi('TeamDocument');
export const UpdateTeamDocumentSchema = createInsertSchema(teamDocument)
  .partial()
  .omit({ teamId: true, type: true });
export const CreateTeamDocumentSchema = createInsertSchema(teamDocument);

export const PostTeamDocumentBodySchema = z.object({
  paymentProofMediaId: z.string(),
});

export const TeamSubmissionSchema = createSelectSchema(
  competitionSubmission,
).extend({
  media: MediaSchema,
});
export const InsertTeamSubmissionSchema = createInsertSchema(
  competitionSubmission,
).omit({
  createdAt: true,
  updatedAt: true,
  teamId: true,
  judgeResponse: true,
});
export const ListTeamSubmissionSchema = z.array(TeamSubmissionSchema);

export const TeamSchema = createSelectSchema(team, {
  createdAt: z.union([z.string(), z.date()]),
})
  .extend({
    competition: createSelectSchema(competition).optional(),
    teamMembers: z.array(TeamMemberSchema).optional(),
    document: z.array(TeamDocumentSchema).optional(),
    submission: z.array(TeamSubmissionSchema).optional(),
    voucer: VoucerSchema.optional(),
    eligibleForVoucer: z.boolean().optional(),
  })
  .openapi('Team');

export const BarebonesTeamSchema = createSelectSchema(team, {
  createdAt: z.union([z.string(), z.date()]),
});

export const UpdateTeamSchema = createInsertSchema(team)
  .omit({
    updatedAt: true,
    createdAt: true,
    id: true,
    competitionId: true,
    joinCode: true,
  })
  .partial();

export const TeamIdParam = z.object({ teamId: z.string() });

export const StageQuery = z.object({
  stage: z
    .string()
    .optional()
    .openapi({
      param: {
        in: 'query',
        required: false,
      },
    }),
});

export const TeamCodeBody = z.object({
  teamCode: z.string(),
});

export const TeamMemberIdSchema = z.object({ userId: z.string() });

export const PutChangeTeamNameBodySchema = z.object({
  name: z.string().min(1),
});

export const PostTeamBodySchema = createInsertSchema(team).pick({
  competitionId: true,
  name: true,
});

export const SubmissionRequirementSchema = createSelectSchema(
  competitionSubmissionRequirement,
);

export const ListSubmissionRequirementSchema = z.array(
  z.object({
    requirement: SubmissionRequirementSchema,
    submission: TeamSubmissionSchema.optional(),
  }),
);

export const CompetitionIdParam = z.object({
  competitionId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const TeamCompetitionDetailSchema = TeamSchema.extend({
  teamMembers: z.array(TeamMemberSchema),
  competitionStage: z.string(),
});

export const ListTeamSchema = z.array(TeamSchema);

export const ApplyVoucerBodyShcema = z.object({
  code: z.string(),
});
