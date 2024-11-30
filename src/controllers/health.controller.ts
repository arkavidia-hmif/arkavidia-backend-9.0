import { getHealthStatusRoute } from '../routes/health.route';
import { createRouter } from '../utils/router-factory';

export const healthRouter = createRouter();

healthRouter.openapi(getHealthStatusRoute, async (c) => {
	return c.json(
		{
			message: 'API is running sucesfully!',
		},
		200,
	);
});
