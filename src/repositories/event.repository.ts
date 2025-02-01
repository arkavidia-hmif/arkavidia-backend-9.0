import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { event, eventTimeline } from '~/db/schema';

export const getEvent = async (db: Database) => {
  return await db.query.event.findMany();
};

export const getEventById = async (db: Database, eventId: string) => {
  return await db.query.event.findFirst({
    where: eq(event.id, eventId),
  });
};

export const getEventTimeline = async (db: Database) => {
  return await db.query.eventTimeline.findMany();
};

export const getEventTimelineById = async (db: Database, eventId: string) => {
  return await db.query.eventTimeline.findFirst({
    where: eq(eventTimeline.eventId, eventId),
  });
};
