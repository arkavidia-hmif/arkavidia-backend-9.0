import { createId } from '@paralleldrive/cuid2';
import { env } from '~/configs/env.config';
import { createPutObjectPresignedUrl } from '~/lib/s3';
import { getPresignedLink } from '~/routes/media.route';
import { createAuthRouter } from '~/utils/router-factory';

export const mediaRouter = createAuthRouter();

mediaRouter.openapi(getPresignedLink, async (c) => {
  const { filename, bucket } = c.req.valid('query');
  const key = `${createId()}-${filename}`;

  const expiresIn = 60;
  return c.json(
    {
      presignedUrl: await createPutObjectPresignedUrl(key, bucket, expiresIn),
      mediaUrl: `${env.S3_ENDPOINT}/${bucket}/${key}`,
      expiresIn,
    },
    200,
  );
});
