import { db } from '~/db/drizzle';
import {
  createEventTeam,
  getEventTeam,
  getEventTeamById,
} from '~/repositories/event-team.repository';
import {
  getEventTeamByTeamIdRoute,
  getEventTeamRoute,
  postCreateEventTeamRoute,
  postCreateEventTeamSoloRoute,
} from '~/routes/event-team.route';
import { createAuthRouter } from '~/utils/router-factory';

export const eventTeamProtectedRouter = createAuthRouter();

eventTeamProtectedRouter.openapi(postCreateEventTeamSoloRoute, async (c) => {
  try {
    const res = await createEventTeam(
      db,
      'solo',
      c.var.user.id,
      c.req.valid('param').eventId,
    );
    return c.json(res, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500,
      );
    }

    return c.json(
      {
        error: 'Unexpected error occured',
      },
      500,
    );
  }
});

eventTeamProtectedRouter.openapi(postCreateEventTeamRoute, async (c) => {
  try {
    const res = await createEventTeam(
      db,
      'team',
      c.var.user.id,
      c.req.valid('param').eventId,
      c.req.valid('json').name,
    );
    return c.json(res, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500,
      );
    }

    return c.json(
      {
        error: 'Unexpected error occured',
      },
      500,
    );
  }
});

eventTeamProtectedRouter.openapi(getEventTeamRoute, async (c) => {
  try {
    const res = await getEventTeam(db, c.var.user.id);
    return c.json(res, 200);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500,
      );
    }

    return c.json(
      {
        error: 'Unexpected error occured',
      },
      500,
    );
  }
});

eventTeamProtectedRouter.openapi(getEventTeamByTeamIdRoute, async (c) => {
  try {
    const res = await getEventTeamById(db, c.req.valid('param').teamId);
    return c.json(res, 200);
  } catch (error) {
    if (error instanceof Error) {
      return c.json(
        {
          error: error.message,
        },
        500,
      );
    }

    return c.json(
      {
        error: 'Unexpected error occured',
      },
      500,
    );
  }
});

// TODO: Implement controller for putEventTeamRoute
