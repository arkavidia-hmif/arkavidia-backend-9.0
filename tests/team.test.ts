import { describe, it, expect, test, beforeAll } from "bun:test";
import { app } from "~/index";
import { createRequest } from "./test-utils";

describe("Team API Check", () => {
    describe("Middleware Check", () => {
        it("should return 401 Unauthorized if no token is provided", async () => {
            const req = createRequest("GET", "http://localhost/api/team", {});
            const res = await app.fetch(req);
            expect(res.status).toBe(401);
        });
    });

    describe("Team Creation", () => {
        beforeAll(async () => {});
        it("should return 400 Bad Request if no data is provided", async () => {
            const req = createRequest("POST", "http://localhost/api/team", {});
            const res = await app.fetch(req);
            expect(res.status).toBe(400);
        });
        it("should return 400 Bad Request if no competition id is provided", async () => {
            const req = createRequest("POST", "http://localhost/api/team", {
                name: "Team 1",
            });

            const res = await app.fetch(req);
            expect(res.status).toBe(400);
        });

        it("should return 400 Bad Request if no name is provided", async () => {
            const req = createRequest("POST", "http://localhost/api/team", {
                competition_id: 1,
            });

            const res = await app.fetch(req);
            expect(res.status).toBe(400);
        });
    });
});
