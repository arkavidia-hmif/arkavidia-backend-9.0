import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { eventTeam } from '~/db/schema';

import { EventTeamMemberSchema } from './event-team-member.type';
import { EventSchema } from './event.type';

/* MAIN SCHEMA */
export const EventTeamSchema = createSelectSchema(eventTeam)
  .extend({
    event: EventSchema.optional(),
    teamMembers: z.array(EventTeamMemberSchema).optional(),
    // document: z.array(TeamDocumentSchema).optional(),
    // submission: z.array(TeamSubmissionSchema).optional(),
  })
  .openapi('EventTeam');

export const ListEventTeamSchema = z.array(EventTeamSchema);

export const CreateEventTeamSchema = createInsertSchema(eventTeam).omit({
  id: true,
  stage: true,
  verificationStatus: true,
  preeliminaryStatus: true,
  finalStatus: true,
  joinCode: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateEventTeamSchema = createInsertSchema(eventTeam)
  .omit({
    id: true,
    eventId: true,
    joinCode: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

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
