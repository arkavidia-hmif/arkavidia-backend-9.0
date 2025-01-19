import { createId } from '@paralleldrive/cuid2';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import { createPutObjectPresignedUrl } from '~/lib/s3';
import { insertMediaFromUrl } from '~/repositories/media.repository';
import { getPresignedLink } from '~/routes/media.route';
import { createAuthRouter } from '~/utils/router-factory';

export const mediaRouter = createAuthRouter();

mediaRouter.openapi(getPresignedLink, async (c) => {
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
