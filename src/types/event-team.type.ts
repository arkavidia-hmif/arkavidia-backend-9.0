import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { eventTeam, eventTeamMember } from '~/db/schema';

/* MAIN SCHEMA */
export const EventTeamSchema = createSelectSchema(eventTeam)
  .merge(createSelectSchema(eventTeamMember))
  .openapi('EventTeam');

export const ListEventTeamSchema = z.array(EventTeamSchema);

/* BODY SCHEMA */
export const CreateEventTeamBodySchema = z.object({
  eventId: z.string(),
});

export const CreateEventTeamWithNameBodySchema =
  CreateEventTeamBodySchema.extend({
    name: z.string(),
  });

export const PutChangeEventTeamNameBodySchema = z.object({
  name: z.string().min(1),
});

export const PutEventTeamDocumentBodySchema = z.object({
  paymentProofMediaId: z.string(),
});

export const EventTeamMemberIdSchema = z.object({ userId: z.string() });


/* PARAM SCHEMA */
export const TeamIdParamSchema = z.object({
  teamId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});
