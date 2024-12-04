import { z } from 'zod';

export const TeamIdParam = z.object({ teamId: z.string() });
