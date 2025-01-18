import { type Hook, OpenAPIHono, type z } from '@hono/zod-openapi';
import { authMiddleware } from '~/middlewares/auth.middleware';
import { JWTPayloadSchema } from '~/types/auth.type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.flatten() }, 400);
  }
};

export function createRouter() {
  return new OpenAPIHono({ defaultHook });
}

export function createAuthRouter() {
  const authRouter = new OpenAPIHono<{
    Variables: {
      user: z.infer<typeof JWTPayloadSchema>;
    };
  }>({ defaultHook });

  authRouter.use(authMiddleware());

  authRouter.use(async (c, next) => {
    const payload = JWTPayloadSchema.parse(c.var.jwtPayload);
    c.set('user', payload);
    await next();
  });

  return authRouter;
}
