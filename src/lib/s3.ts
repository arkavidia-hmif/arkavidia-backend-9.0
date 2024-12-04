import {
	S3Client,
	GetObjectCommand,
	PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '~/configs/env.config';

const S3 = new S3Client({
	region: 'auto',
	endpoint: env.S3_ENDPOINT,
	credentials: {
		accessKeyId: env.S3_ACCESS_KEY_ID,
		secretAccessKey: env.S3_SECRET_ACCESS_KEY,
	},
});

export const createPutObjectPresignedUrl = async (
	key: string,
	bucketName: string,
	expiresIn: number,
) => {
	return await getSignedUrl(
		S3,
		new PutObjectCommand({ Bucket: bucketName, Key: key }),
		{ expiresIn },
	);
};

export const createGetObjectPresignedUrl = async (
	key: string,
	bucketName: string,
) => {
	return await getSignedUrl(
		S3,
		new GetObjectCommand({ Bucket: bucketName, Key: key }),
	);
};
