import { beforeAll, describe, expect, it, test } from 'bun:test';
import { app } from '~/index';

describe('Health API Check', () => {
	let req: Request;
	let res: Response;

	beforeAll(async () => {
		req = new Request('http://localhost/api/health');
		res = await app.fetch(req);
	});

	it('should return 200 OK', async () => {
		expect(res.status).toBe(200);
	});

	it('should return a JSON object containing message', async () => {
		const data = await res.json();
		expect(data).toEqual({ message: 'API is running sucesfully!' });
	});
});
