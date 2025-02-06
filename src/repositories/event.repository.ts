import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import {
  event,
  eventSubmission,
  eventSubmissionRequirement,
  eventTimeline,
} from '~/db/schema';
import { InsertEventTeamSubmissionSchema } from '~/types/event-team.type';

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

export const getEventSubmissionRequirement = async (
  db: Database,
  eventId: string,
) => {
  return await db.query.eventSubmissionRequirement.findMany({
    where: eq(eventSubmissionRequirement.eventId, eventId),
    orderBy: (eventSubmissionRequirement, { asc }) => [
      asc(eventSubmissionRequirement.order),
    ],
    with: {
      media: true,
    },
  });
};

export const getEventSubmissionRequirementById = async (
  db: Database,
  typeId: string,
) => {
  return await db.query.eventSubmissionRequirement.findFirst({
    where: eq(eventSubmissionRequirement.typeId, typeId),
  });
};

export const createEventTeamSubmission = async (
  db: Database,
  teamId: string,
  values: z.infer<typeof InsertEventTeamSubmissionSchema>,
) => {
  return db
    .insert(eventSubmission)
    .values({ teamId, ...values })
    .returning()
    .then(firstSure);
};
