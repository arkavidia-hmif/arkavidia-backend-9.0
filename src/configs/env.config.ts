import { z } from 'zod';

const EnvSchema = z.object({
	PORT: z.coerce.number().default(5000),
	DATABASE_URL: z.string().url(),
	ALLOWED_ORIGINS: z
		.string()
		.default('["http://localhost:5173"]')
		.transform((value) => JSON.parse(value))
		.pipe(z.array(z.string().url())),
	JWT_SECRET: z.string(),
	TOKEN_EXPIRATION: z.string(),
	SMTP_HOST: z.string(),
	SMTP_USER: z.string(),
	SMTP_PASSWORD: z.string(),
	SMTP_PORT: z.coerce.number().default(465),
	SMTP_SECURE: z.coerce.boolean().default(true),
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
	console.error('Invalid environment variables: ');
	console.error(result.error.flatten().fieldErrors);
	process.exit(1);
}

export const env = result.data;
