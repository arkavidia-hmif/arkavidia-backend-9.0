import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { eventTeam, eventTeamMember } from '~/db/schema';

/* MAIN SCHEMA */
export const EventTeamSchema = createSelectSchema(eventTeam)
  .merge(createSelectSchema(eventTeamMember))
  .openapi('EventTeam');

export const ListEventTeamSchema = z.array(EventTeamSchema);

/* BODY SCHEMA */
export const EventTeamNameBodySchema = z.object({
  name: z.string(),
});

// TODO: Implement PutEventTeamBodySchema

/* PARAM SCHEMA */
export const TeamIdParamSchema = z.object({
  teamId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});
