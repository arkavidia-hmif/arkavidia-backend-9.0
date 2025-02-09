import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { eventTeamMember, eventTeamMemberDocument } from '~/db/schema';

import { MediaSchema } from './media.type';
import { UserSchema } from './user.type';

export const EventTeamMemberDocumentSchema = createSelectSchema(
  eventTeamMemberDocument,
)
  .merge(
    z.object({
      media: MediaSchema,
    }),
  )
  .openapi('EventTeamMemberDocument');
export const InsertEventTeamMemberDocumentSchema = createInsertSchema(
  eventTeamMemberDocument,
);
export const UpdateEventTeamMemberDocumentSchema =
  InsertEventTeamMemberDocumentSchema.partial().omit({
    teamId: true,
    userId: true,
    type: true,
  });

export const UpdateEventTeamMemberDocumentRouteSchema = z.object({
  posterMediaId: z.string().optional(),
  twibbonMediaId: z.string().optional(),
});

export const EventTeamMemberSchema = createSelectSchema(eventTeamMember)
  .extend({
    user: UserSchema.optional(),
    document: z.array(EventTeamMemberDocumentSchema).optional(),
  })
  .openapi('EventTeam');

export const ListEventTeamMemberSchema = z.array(EventTeamMemberSchema);

export const CreateEventTeamMemberSchema = createInsertSchema(eventTeamMember);
