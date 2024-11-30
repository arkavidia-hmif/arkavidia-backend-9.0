import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { serve } from 'bun';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { env } from './configs/env.config';
import { apiRouter } from './controllers/api.controller';

const app = new OpenAPIHono({
	defaultHook: (result, c) => {
		if (!result.success) {
			return c.json({ errors: result.error.flatten() }, 400);
		}
	},
});

app.use(
	'/api/*',
	cors({
		credentials: true,
		origin: env.ALLOWED_ORIGINS,
	}),
);

app.get('/', (c) => c.json({ message: 'Server runs successfully' }));

app.route('/api', apiRouter);

app.doc('/openapi.json', {
	openapi: '3.1.0',
	info: {
		version: '1.0',
		title: 'Arkavidia API',
	},
	tags: [
		{ name: 'hello', description: 'Hello API' },
		{ name: 'auth', description: 'Authentication API' },
	],
});

app.get(
	'/docs',
	apiReference({
		theme: 'purple',
		spec: {
			url: '/openapi.json',
		},
	}),
);

console.log(`Server is running on port ${env.PORT}`);

serve({
	fetch: app.fetch,
	port: env.PORT,
});
