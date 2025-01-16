import { createFactory } from 'hono/factory';
import * as jwt from 'hono/jwt';
import { env } from '~/configs/env.config';

const factory = createFactory<{
  Variables: {
    jwtPayload: string;
  };
}>();

export const authMiddleware = () => {
  return factory.createMiddleware(async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) return c.json({ error: 'Not authenticated' }, 401);

    const accessToken = authHeader.replace('Bearer', '').trimStart();

    try {
      const payload = await jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
      c.set('jwtPayload', payload);
      await next();
    } catch (e) {
      return c.json({ error: 'Token not verifiable!' }, 401);
    }
  });
};
