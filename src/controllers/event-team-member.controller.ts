import { db } from '~/db/drizzle';
import {
  getAllEventTeamMembers,
  getEventTeamMember,
  updatePosterEventTeamMember,
  updateTwibbonEventTeamMember,
} from '~/repositories/event-team-member.repository';
import {
  getEventTeamById,
  inferEventVerificationStatus,
  updateEventTeam,
} from '~/repositories/event-team.repository';
import {
  getEventTeamMemberByIdRoute,
  getEventTeamMembersRoute,
  updateEventTeamMemberDocumentRoute,
} from '~/routes/event-team-member.route';
import { createAuthRouter } from '~/utils/router-factory';

export const eventTeamControllerProtectedRouter = createAuthRouter();

eventTeamControllerProtectedRouter.openapi(
  getEventTeamMembersRoute,
  async (c) => {
    const teamId = c.req.valid('param').teamId;
    const teamMembers = await getAllEventTeamMembers(db, teamId, {
      document: true,
      user: { document: true },
    });
    if (teamMembers.length === 0) return c.json({ error: 'Team not found!' });
    return c.json(teamMembers, 200);
  },
);

eventTeamControllerProtectedRouter.openapi(
  getEventTeamMemberByIdRoute,
  async (c) => {
    const { teamId, userId } = c.req.valid('param');
    const teamMember = await getEventTeamMember(db, teamId, userId, {
      document: true,
      user: { document: true },
    });
    if (!teamMember) return c.json({ error: 'Team member not found!' });
    return c.json(teamMember, 200);
  },
);

eventTeamControllerProtectedRouter.openapi(
  updateEventTeamMemberDocumentRoute,
  async (c) => {
    const { teamId, userId } = c.req.valid('param');
    const { posterMediaId, twibbonMediaId } = c.req.valid('json');

    // Check if team exists
    const team = await getEventTeamById(db, teamId, { teamMember: true });
    if (!team) return c.json({ error: "Team doesn't exist!" }, 400);
    if (team.verificationStatus === 'VERIFIED')
      return c.json({ error: 'Your team is already verified!' }, 403);

    if (posterMediaId)
      await updatePosterEventTeamMember(db, userId, teamId, posterMediaId);
    if (twibbonMediaId)
      await updateTwibbonEventTeamMember(db, userId, teamId, twibbonMediaId);

    const verificationStatus =
      team.verificationStatus === 'DENIED'
        ? 'CHANGED'
        : await inferEventVerificationStatus(db, teamId);
    await updateEventTeam(db, teamId, { verificationStatus });

    const updatedTeamMember = await getEventTeamMember(db, teamId, userId, {
      document: true,
      user: { document: true },
    });
    return c.json(updatedTeamMember, 200);
  },
);
