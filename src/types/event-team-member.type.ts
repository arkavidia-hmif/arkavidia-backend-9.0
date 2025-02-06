import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { eventTeamMember } from '~/db/schema';

import { UserSchema } from './user.type';

export const EventTeamMemberSchema = createSelectSchema(eventTeamMember)
  .extend({
    user: UserSchema.optional(),
    // document: z.array(TeamDocumentSchema).optional(),
  })
  .openapi('EventTeam');

export const ListEventTeamMemberSchema = z.array(EventTeamMemberSchema);

export const CreateEventTeamMemberSchema = createInsertSchema(eventTeamMember);
