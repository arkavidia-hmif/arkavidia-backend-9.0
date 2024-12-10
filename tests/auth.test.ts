import { afterAll, beforeAll, describe, expect, it, test } from 'bun:test';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import type { z } from 'zod';
import { db } from '~/db/drizzle';
import { UserIdentity, user, userIdentity } from '~/db/schema';
import { app } from '~/index';
import type { UserSchema } from '~/types/user.type';
import { createRequest } from './test-utils';

describe('Auth API Check', () => {
	beforeAll(async () => {
		await db.delete(user).where(eq(user.email, 'testing-email@test.com'));
		await db
			.delete(userIdentity)
			.where(eq(userIdentity.email, 'testing-email@test.com'));
		const verifyTokenExpiration = new Date(new Date().getTime() + 360000);
		const verifyToken = await argon2.hash(
			`testing-email@test.com${new Date()}${verifyTokenExpiration.toISOString()}`,
		);
		await db.insert(userIdentity).values({
			email: 'testing-email@test.com',
			provider: 'basic',
			hash: await argon2.hash('testing-password-123'),
			isVerified: true,
			role: 'user',
			verificationToken: verifyToken,
			verificationTokenExpiration: verifyTokenExpiration,
		});
	});

	afterAll(async () => {
		await db.delete(user).where(eq(user.email, 'testing-email@test.com'));
		await db
			.delete(userIdentity)
			.where(eq(userIdentity.email, 'testing-email@test.com'));
	});

	describe('Basic Auth Login', () => {
		const req = createRequest('POST', 'http://localhost/api/auth/basic/login', {
			email: 'testing-email@test.com',
			password: 'testing-password-123',
		});
		let res: Response;

		beforeAll(async () => {
			res = await app.fetch(req);
		});

		it('should return 200 OK', () => {
			expect(res.status).toBe(200);
		});

		it('should return accessToken and refreshToken', async () => {
			const data = await res.json();
			expect(data).toHaveProperty('accessToken');
			expect(data).toHaveProperty('refreshToken');

			expect(data.accessToken).toBeTruthy();
			expect(data.refreshToken).toBeTruthy();
		});
	});

	describe('Required Login Actions', () => {
		let loginRes: Response;
		let accToken: string;
		let refToken: string;
		let reqFail: Request;
		let req: Request;
		let selfRequest: Request;
		beforeAll(async () => {
			const loginReq = createRequest(
				'POST',
				'http://localhost/api/auth/basic/login',
				{
					email: 'testing-email@test.com',
					password: 'testing-password-123',
				},
			);
			loginRes = await app.fetch(loginReq);
			const data = await loginRes.json();
			accToken = data.accessToken;
			refToken = data.refreshToken;

			reqFail = createRequest(
				'GET',
				'http://localhost/api/auth/refresh?token=',
				{},
			);
			req = createRequest(
				'GET',
				`http://localhost/api/auth/refresh?token=${refToken}`,
				{},
			);

			selfRequest = createRequest(
				'GET',
				'http://localhost/api/auth/self',
				{},
				accToken,
			);
		});

		describe('Refresh token mechanism', () => {
			let resFail: Response;
			let res: Response;
			it('should return 500 if no refresh token is provided', async () => {
				resFail = await app.fetch(reqFail);
				expect(resFail.status).toBe(400);
			});

			it('should return 200 OK & new tokens if refresh token is provided', async () => {
				res = await app.fetch(req);
				expect(res.status).toBe(200);

				const data = await res.json();
				expect(data).toHaveProperty('accessToken');
				expect(data).toHaveProperty('refreshToken');

				expect(data.accessToken).toBeTruthy();
				expect(data.refreshToken).toBeTruthy();
			});
		});

		describe('Self route check', () => {
			let selfResponse: Response;
			let resData: z.infer<typeof UserSchema>;

			beforeAll(async () => {
				selfResponse = await app.fetch(selfRequest);
				resData = await selfResponse.json();
			});

			it('should return 200', async () => {
				expect(selfResponse.status).toBe(200);
			});

			it('should return data about user', async () => {
				expect(resData.id).toBeTruthy();
				expect(resData.email).toBeTruthy();
				expect(resData.createdAt).toBeTruthy();
			});
		});
	});
});
