import { OpenAPIHono } from '@hono/zod-openapi';
import { authProtectedRouter, authRouter } from './auth.controller';
import { healthRouter } from './health.controller';
import { mediaRouter } from './media.controller';

const unprotectedApiRouter = new OpenAPIHono();
unprotectedApiRouter.route('/', healthRouter);
unprotectedApiRouter.route('/', authRouter);

const protectedApiRouter = new OpenAPIHono();
protectedApiRouter.route('/', authProtectedRouter);
protectedApiRouter.route('/', mediaRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', unprotectedApiRouter);
apiRouter.route('/', protectedApiRouter);
