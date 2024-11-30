import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../configs/env.config';

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client);
export type Database = typeof db;
