import * as Minio from 'minio';
import { env } from '~/configs/env.config';

const client = new Minio.Client({
  endPoint: env.S3_ENDPOINT,
  // port: 9000,
  useSSL: true,
  accessKey: env.S3_ACCESS_KEY_ID,
  secretKey: env.S3_SECRET_ACCESS_KEY,
});

export const createPutObjectPresignedUrl = async (
  key: string,
  bucketName: string,
  expiresIn: number,
) => {
  return await client.presignedPutObject(bucketName, key, expiresIn);
};
