import { db } from '~/db/drizzle';
import {
  getAllTeamMembers,
  getTeamMember,
  isUserInTeam,
  updatePosterTeamMember,
  updateTwibbonTeamMember,
} from '~/repositories/team-member.repository';
import { getTeamById } from '~/repositories/team.repository';
import {
  getTeamMemberByIdRoute,
  getTeamMembersRoute,
  updateTeamMemberDocumentRoute,
} from '~/routes/team-member.route';
import { createAuthRouter } from '~/utils/router-factory';

export const teamMemberProtectedRouter = createAuthRouter();

teamMemberProtectedRouter.openapi(getTeamMembersRoute, async (c) => {
  const teamId = c.req.valid('param').teamId;
  const userId = c.var.user.id;

  const teamMembers = await getAllTeamMembers(db, teamId, {
    document: true,
    user: { document: true },
  });
  if (teamMembers.length === 0) return c.json({ error: 'Team not found!' });

  const isUserInTeam = teamMembers.find((tm) => tm.userId === userId);
  if (!isUserInTeam)
    return c.json({ error: 'You are not a member of this team!' });

  return c.json(teamMembers, 200);
});

teamMemberProtectedRouter.openapi(getTeamMemberByIdRoute, async (c) => {
  const { teamId, userId } = c.req.valid('param');

  if (!(await isUserInTeam(db, teamId, userId)))
    return c.json({ error: 'You are not a member of this team!' });

  const teamMember = await getTeamMember(db, teamId, userId, {
    document: true,
    user: { document: true },
  });
  if (!teamMember) return c.json({ error: 'Team member not found!' });
  return c.json(teamMember, 200);
});

teamMemberProtectedRouter.openapi(updateTeamMemberDocumentRoute, async (c) => {
  const { teamId, userId } = c.req.valid('param');
  const { posterMediaId, twibbonMediaId } = c.req.valid('json');

  // Check if team exists
  const team = await getTeamById(db, teamId, { teamMember: true });
  if (!team) return c.json({ error: "Team doesn't exist!" }, 400);
  if (!(await isUserInTeam(db, teamId, userId)))
    return c.json({ error: 'You are not a member of this team!' });

  console.log(posterMediaId, twibbonMediaId);

  if (posterMediaId)
    await updatePosterTeamMember(db, userId, teamId, posterMediaId);
  if (twibbonMediaId)
    await updateTwibbonTeamMember(db, userId, teamId, twibbonMediaId);

  const updatedTeamMember = await getTeamMember(db, teamId, userId, {
    document: true,
    user: { document: true },
  });
  return c.json(updatedTeamMember, 200);
});
