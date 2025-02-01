import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { event, eventTimeline } from '~/db/schema/event.schema';

export const EventSchema = createSelectSchema(event).openapi('Event');

export const ListEventSchema = z.array(EventSchema);

export const EventIdParam = z.object({
  eventId: z.string().openapi({
    param: {
      in: 'path',
      required: true,
    },
  }),
});

export const EventTimelineSchema =
  createSelectSchema(eventTimeline).openapi('EventTimeline');

export const ListEventTimelineSchema = z.array(EventTimelineSchema);
