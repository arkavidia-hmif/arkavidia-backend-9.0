import { createId } from '@paralleldrive/cuid2';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import {
  createGetObjectPresignedUrl,
  createPutObjectPresignedUrl,
} from '~/lib/s3';
import {
  getMediaByUrl,
  insertMediaFromUrl,
} from '~/repositories/media.repository';
import {
  getDownloadPresignedLink,
  getUploadPresignedLink,
} from '~/routes/media.route';
import { createAuthRouter } from '~/utils/router-factory';

export const mediaRouter = createAuthRouter();

mediaRouter.openapi(getUploadPresignedLink, async (c) => {
  const user = c.var.user;

  const { filename, bucket } = c.req.valid('query');
  const key = `${createId()}-${filename}`;
  const mediaUrl = `${env.S3_ENDPOINT}/${bucket}/${key}`;

  const media = (await insertMediaFromUrl(db, user.id, mediaUrl))[0];

  const expiresIn = 60;
  return c.json(
    {
      presignedUrl: await createPutObjectPresignedUrl(key, bucket, expiresIn),
      mediaId: media.id,
      mediaUrl,
      expiresIn,
    },
    200,
  );
});

mediaRouter.openapi(getDownloadPresignedLink, async (c) => {
  const user = c.var.user;

  const { filename, bucket } = c.req.valid('query');
  const expiresIn = 3600;
  const mediaUrl = `${env.S3_ENDPOINT}/${bucket}/${filename}`;

  console.log(mediaUrl);

  const media = await getMediaByUrl(db, mediaUrl);

  if (!media || media.bucket !== bucket)
    return c.json({ error: 'Media not found' }, 404);
  if (media.creatorId !== user.id && !user.role.includes('admin'))
    return c.json({ error: 'You do not have access to this media' }, 403);

  const url = await createGetObjectPresignedUrl(filename, bucket, expiresIn);

  return c.json(
    {
      presignedUrl: url,
      mediaId: media.id,
      mediaUrl: url,
      expiresIn,
    },
    200,
  );
});
