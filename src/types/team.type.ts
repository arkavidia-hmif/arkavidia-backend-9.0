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

export const TeamDocumentSchema =
  createSelectSchema(teamDocument).openapi('TeamDocument');
export const UpdateTeamDocumentSchema = createInsertSchema(teamDocument)
  .partial()
  .omit({ teamId: true, type: true });
export const CreateTeamDocumentSchema = createInsertSchema(teamDocument);

export const PostTeamDocumentBodySchema = z.object({
  paymentProofMediaId: z.string(),
});

export const TeamSchema = createSelectSchema(team, {
  createdAt: z.union([z.string(), z.date()]),
})
  .extend({
    competition: createSelectSchema(competition).optional(),
  })
  .openapi('Team');

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

export const putChangeTeamNameBodySchema = z.object({
  name: z.string().min(1),
});

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

export const PostTeamVerificationBodySchema = z.object({
  isVerified: z.boolean(),
  verificationError: z.string().optional(),
});

export const PostTeamBodySchema = createInsertSchema(team).pick({
  competitionId: true,
  name: true,
});

export const TeamSubmissionSchema = createSelectSchema(competitionSubmission);
export const SubmissionRequirementSchema = createSelectSchema(
  competitionSubmissionRequirement,
);

export const ListSubmissionRequirementSchema = z.array(
  z.object({
    requirement: SubmissionRequirementSchema,
    competition_submission: TeamSubmissionSchema.nullable(),
    media: MediaSchema.nullable(),
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

export const ListUserTeamSchema = z.array(TeamSchema);

export const CompetitionTeamStatisticSchema = z.object({
  competitionId: z.string(),
  totalTeam: z.number(),
  totalVerifiedTeam: z.number(),
});

export const TeamStatisticSchema = z.object({
  totalTeam: z.number(),
  totalVerifiedTeam: z.number(),
  result: z.array(CompetitionTeamStatisticSchema),
});
