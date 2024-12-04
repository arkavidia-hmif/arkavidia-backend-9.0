import { type Hook, OpenAPIHono, z } from '@hono/zod-openapi';

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const defaultHook: Hook<any, any, any, any> = (result, c) => {
	if (!result.success) {
		return c.json({ errors: result.error.flatten() }, 400);
	}
};

export function createRouter() {
	return new OpenAPIHono({ defaultHook });
}
