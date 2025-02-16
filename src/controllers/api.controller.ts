import { OpenAPIHono } from '@hono/zod-openapi';

import { adminCompetitionProtectedRouter } from './admin-competition.controller';
import { adminEventProtectedRouter } from './admin-event.controller';
import { analyticsProtectedRouter } from './analytics.controller';
import { authProtectedRouter, authRouter } from './auth.controller';
import {
  competitionProtectedRouter,
  competitionRouter,
} from './competition.controller';
import { eventTeamMemberProtectedRouter } from './event-team-member.controller';
import { eventTeamProtectedRouter } from './event-team.controller';
import { eventProtectedRouter, eventRouter } from './event.controller';
import { healthRouter } from './health.controller';
import { mediaRouter } from './media.controller';
import { teamMemberProtectedRouter } from './team-member.controller';
import { teamProtectedRouter } from './team.controller';
import { userProtectedRouter } from './user.controller';

const unprotectedApiRouter = new OpenAPIHono();
unprotectedApiRouter.route('/', healthRouter);
unprotectedApiRouter.route('/', authRouter);
unprotectedApiRouter.route('/', competitionRouter);
unprotectedApiRouter.route('/', eventRouter);

const protectedApiRouter = new OpenAPIHono();
protectedApiRouter.route('/', authProtectedRouter);
protectedApiRouter.route('/', mediaRouter);
protectedApiRouter.route('/', teamProtectedRouter);
protectedApiRouter.route('/', teamMemberProtectedRouter);
protectedApiRouter.route('/', teamProtectedRouter);
protectedApiRouter.route('/', userProtectedRouter);
protectedApiRouter.route('/', competitionProtectedRouter);
protectedApiRouter.route('/', analyticsProtectedRouter);
protectedApiRouter.route('/', adminCompetitionProtectedRouter);
protectedApiRouter.route('/', adminEventProtectedRouter);
protectedApiRouter.route('/', eventTeamProtectedRouter);
protectedApiRouter.route('/', eventTeamMemberProtectedRouter);
protectedApiRouter.route('/', eventProtectedRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', unprotectedApiRouter);
apiRouter.route('/', protectedApiRouter);
