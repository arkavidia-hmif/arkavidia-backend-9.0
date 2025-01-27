import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { teamMemberDocument } from '~/db/schema';
import { teamMember } from '~/db/schema/team-member.schema';

import { MediaSchema } from './media.type';
import { UserSchema } from './user.type';

export const TeamMemberDocumentSchema = createSelectSchema(teamMemberDocument)
  .merge(
    z.object({
      media: MediaSchema,
    }),
  )
  .openapi('TeamMemberDocument');
export const InsertTeamMemberDocumentSchema =
  createInsertSchema(teamMemberDocument);
export const UpdateTeamMemberDocumentSchema =
  InsertTeamMemberDocumentSchema.partial().omit({
    teamId: true,
    userId: true,
    type: true,
  });

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
      user: UserSchema.optional(),
      document: z.array(TeamMemberDocumentSchema).optional(),
    }),
  )
  .openapi('TeamMember');

export const UpdateTeamMemberDocumentRouteSchema = z.object({
  posterMediaId: z.string().optional(),
  twibbonMediaId: z.string().optional(),
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
