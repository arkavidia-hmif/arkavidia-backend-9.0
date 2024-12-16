import { OpenAPIHono } from '@hono/zod-openapi';
import { authProtectedRouter, authRouter } from './auth.controller';
import { healthRouter } from './health.controller';
import { mediaRouter } from './media.controller';
import { teamMemberProtectedRouter } from './team-member.controller';
import { teamProtectedRouter } from './team.controller';
import { userProtectedRouter } from './user.controller';
import { competitionProtectedRouter } from '~/controllers/competition.controller';

const unprotectedApiRouter = new OpenAPIHono();
unprotectedApiRouter.route('/', healthRouter);
unprotectedApiRouter.route('/', authRouter);

const protectedApiRouter = new OpenAPIHono();
protectedApiRouter.route('/', authProtectedRouter);
protectedApiRouter.route('/', mediaRouter);
protectedApiRouter.route('/', teamProtectedRouter);
protectedApiRouter.route('/', teamMemberProtectedRouter);
protectedApiRouter.route('/', teamProtectedRouter);
protectedApiRouter.route('/', userProtectedRouter);
protectedApiRouter.route('/', competitionProtectedRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', unprotectedApiRouter);
apiRouter.route('/', protectedApiRouter);
