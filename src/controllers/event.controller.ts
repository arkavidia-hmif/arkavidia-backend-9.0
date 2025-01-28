import { db } from '~/db/drizzle';
import {
  getEvent,
  getEventById,
  getEventTimeline,
  getEventTimelineById,
} from '~/repositories/event.repository';
import {
  getEventByIdRoute,
  getEventRoute,
  getEventTimelineByIdRoute,
  getEventTimelineRoute,
} from '~/routes/event.route';
import { createAuthRouter, createRouter } from '~/utils/router-factory';

export const eventProtectedRouter = createAuthRouter();
export const eventRouter = createRouter();

eventRouter.openapi(getEventRoute, async (c) => {
  const events = await getEvent(db);
  return c.json(events, 200);
});

eventRouter.openapi(getEventByIdRoute, async (c) => {
  const { eventId } = c.req.valid('param');
  const event = await getEventById(db, eventId);
  return c.json(event, 200);
});

eventRouter.openapi(getEventTimelineRoute, async (c) => {
  const timelines = await getEventTimeline(db);
  return c.json(timelines, 200);
});

eventRouter.openapi(getEventTimelineByIdRoute, async (c) => {
  const { eventId } = c.req.valid('param');
  const timelines = await getEventTimelineById(db, eventId);
  return c.json(timelines, 200);
});
