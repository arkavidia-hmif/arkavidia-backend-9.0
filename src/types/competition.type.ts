import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { competitionAnnouncement } from '~/db/schema';

export const AnnouncementSchema = createSelectSchema(competitionAnnouncement, {
	createdAt: z.union([z.string(), z.date()]),
}).openapi('Announcement');

export const AllAnnouncementSchema = z.array(AnnouncementSchema);

export const CompetitionIdParam = z.object({
	competitionId: z.string().openapi({
		param: {
			in: 'path',
			required: true,
		},
	}),
});

export const PostCompAnnouncementBodySchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
});
