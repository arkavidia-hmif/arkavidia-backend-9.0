import { z } from 'zod';
import { mediaBucketEnum } from '~/db/schema/media.schema';

export const GetPresignedLinkQuerySchema = z.object({
	filename: z.string().openapi({
		description: 'name of file with extension',
		example: 'cat.png',
		param: {
			in: 'query',
			required: true,
		},
	}),
	bucket: z.enum(mediaBucketEnum.enumValues).openapi({
		example: 'competition-registration',
		param: {
			in: 'query',
			required: true,
		},
	}),
});

export const PresignedUrlSchema = z
	.object({
		presignedUrl: z.string().url(),
		mediaUrl: z.string().url(),
		expiresIn: z.number().openapi({
			example: 3600,
		}),
	})
	.openapi('PresignedURL');
