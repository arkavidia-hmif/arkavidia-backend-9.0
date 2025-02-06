import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { eventTeam, eventTeamDocument } from '~/db/schema';

import { EventTeamMemberSchema } from './event-team-member.type';
import { EventSchema } from './event.type';
import { MediaSchema } from './media.type';

/* EVENT TEAM DOCUMENT SCHEMA */
export const EventTeamDocumentSchema = createSelectSchema(eventTeamDocument)
  .merge(
    z.object({
      media: MediaSchema,
    }),
  )
  .openapi('EventTeamDocument');
export const UpdateEventTeamDocumentSchema = createInsertSchema(
  eventTeamDocument,
)
  .partial()
  .omit({ teamId: true, type: true });
export const CreateEventTeamDocumentSchema =
  createInsertSchema(eventTeamDocument);

export const PutEventTeamDocumentBodySchema = z.object({
  paymentProofMediaId: z.string(),
});

/* EVENT TEAM SCHEMA */
export const EventTeamSchema = createSelectSchema(eventTeam)
  .extend({
    event: EventSchema.optional(),
    teamMembers: z.array(EventTeamMemberSchema).optional(),
    document: z.array(EventTeamDocumentSchema).optional(),
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

export const EventTeamMemberIdSchema = z.object({ userId: z.string() });

/* PARAM SCHEMA */
export const EventTeamIdParam = z.object({
  teamId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const EventTeamAndUserIdParam = z.object({
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
