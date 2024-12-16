import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { teamMember } from '~/db/schema/team-member.schema';
import { MediaSchema } from './media.type';

export const TeamAndUserIdParam = z.object({
  teamId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
  userId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const TeamMemberSchema = createSelectSchema(teamMember)
  .merge(
    z.object({
      nisn: MediaSchema,
      kartu: MediaSchema,
      poster: MediaSchema,
      twibbon: MediaSchema,
    }),
  )
  .openapi('TeamMember');

export const PostTeamMemberDocumentBodySchema = createInsertSchema(
  teamMember,
).pick({
  nisnMediaId: true,
  kartuMediaId: true,
  posterMediaId: true,
  twibbonMediaId: true,
});

export const CompetitionAndTeamAndUserIdParam = z.object({
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
  userId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const PostTeamMemberVerificationBodySchema = z.object({
  isVerified: z.boolean(),
  verificationError: z.string().optional(),
});
