import { createFactory } from 'hono/factory';
import type { z } from 'zod';
import { db } from '~/db/drizzle';
import type { UserIdentityRolesEnum } from '~/db/schema';
import { findUserIdentityById } from '~/repositories/auth.repository';
import { getCompetition } from '~/repositories/competition.repository';
import { getEventById } from '~/repositories/event.repository';
import type { JWTPayloadSchema } from '~/types/auth.type';

const factory = createFactory<{
  Variables: {
    user: z.infer<typeof JWTPayloadSchema>;
  };
}>();

export const transformRoleToName = (role: UserIdentityRolesEnum) => {
  switch (role) {
    case 'admin_competition_arkalogica':
      return 'Arkalogica';
    case 'admin_competition_cp':
      return 'CP';
    case 'admin_competition_ctf':
      return 'CTF';
    case 'admin_competition_datavidia':
      return 'Datavidia';
    case 'admin_competition_hackvidia':
      return 'Hackvidia';
    case 'admin_competition_uxvidia':
      return 'UXvidia';
    case 'admin_event_academya_uiux':
      return 'Academya - UI UX';
    case 'admin_event_academya_pm':
      return 'Academya - Product Management';
    case 'admin_event_academya_softeng':
      return 'Academya - Software Engineering';
    case 'admin_event_academya_datsci':
      return 'Academya - Data Science';
  }
};

export const transformNameToRole = (
  name: string,
): UserIdentityRolesEnum | undefined => {
  switch (name) {
    case 'Arkalogica':
      return 'admin_competition_arkalogica';
    case 'CP':
      return 'admin_competition_cp';
    case 'CTF':
      return 'admin_competition_ctf';
    case 'Datavidia':
      return 'admin_competition_datavidia';
    case 'Hackvidia':
      return 'admin_competition_hackvidia';
    case 'UXvidia':
      return 'admin_competition_uxvidia';
    case 'Academya - UI UX':
      return 'admin_event_academya_uiux';
    case 'Academya - Product Management':
      return 'admin_event_academya_pm';
    case 'Academya - Software Engineering':
      return 'admin_event_academya_softeng';
    case 'Academya - Data Science':
      return 'admin_event_academya_datsci';
  }
};

export const roleMiddleware = (requestedRole: UserIdentityRolesEnum) => {
  return factory.createMiddleware(async (c, next) => {
    const role = (await findUserIdentityById(db, c.var.user.id))?.role;
    const param = c.req.param();

    if (role === 'admin') await next();
    else {
      let authorized: boolean = true;
      if (param.competitionId) {
        const competition = await getCompetition(db, param.competitionId);
        if (
          role !== 'admin_competition' &&
          role !== transformNameToRole(competition?.title as string)
        )
          authorized = false;
      } else {
        authorized = role?.includes(requestedRole) as boolean;
      }

      if (param.eventId) {
        const event = await getEventById(db, param.eventId);
        if (
          role !== 'admin_event' &&
          role !== transformNameToRole(event?.title as string)
        )
          authorized = false;
      } else {
        authorized = role?.includes(requestedRole) as boolean;
      }

      if (!authorized) {
        return c.json({ message: 'Unauthorized' }, 403);
      }

      await next();
    }
  });
};
