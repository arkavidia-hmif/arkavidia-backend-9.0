import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { competition, competitionSubmission, team } from '~/db/schema';

import { TeamMemberSchema } from './team-member.type';

export const PostTeamDocumentBodySchema = createInsertSchema(team).pick({
  paymentProofMediaId: true,
});

export const TeamSchema = createSelectSchema(team, {
  createdAt: z.union([z.string(), z.date()]),
})
  .extend({
    competititon: createSelectSchema(competition).optional(),
  })
  .openapi('Team');

export const TeamIdParam = z.object({ teamId: z.string() });

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

export const TeamSubmissionSchema = createSelectSchema(
  competitionSubmission,
).extend({
  file: z
    .object({
      id: z.string(),
      name: z.string(),
      createdAt: z.date(),
      creatorId: z.string(),
      bucket: z.string(),
      type: z.string(),
      url: z.string(),
    })
    .nullable(),
  requirement: z.object({
    competitionId: z.string(),
    typeId: z.string(),
    typeName: z.string(),
    deadline: z.date().nullable(),
  }),
});

type TeamSubmissionSchema = z.infer<typeof TeamSubmissionSchema>;

export const CompetitionIdParam = z.object({
  competitionId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const TeamCompetitionSchema = z.array(
  TeamSchema.extend({
    teamMembers: z.array(TeamMemberSchema),
  }),
);

export const TeamCompetitionDetailSchema = TeamSchema.extend({
  teamMembers: z.array(TeamMemberSchema),
});

export const ListUserTeamSchema = z.array(TeamSchema);
