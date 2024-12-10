import 'dotenv/config';
import postgres from 'postgres';
import path from 'node:path';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required');
}

const sql = postgres(process.env.DATABASE_URL);

async function runGenerateIdentityTrigger() {
	const migrationPath = path.join(
		import.meta.dir,
		'../../drizzle/generate_identity_trigger.sql',
	);

	const migrationFile = Bun.file(migrationPath);
	if (!(await migrationFile.exists()))
		throw new Error(
			'Ensure there is the SQL migration file in drizzle/generate_identity_trigger.sql',
		);

	const migration = await migrationFile.text();
	try {
		await sql.unsafe(migration);
		console.log('\nTrigger and function created successfully.');
	} catch (err) {
		if (err instanceof postgres.PostgresError && err.code === '42723') {
			console.log('\nTrigger and function already exists!');
			process.exit(0);
		}
		console.error('Failed to execute migration:', err);
		throw err;
	}
}

if (require.main === module) {
	(async () => {
		try {
			await runGenerateIdentityTrigger();
		} catch (err) {
			console.error('Migration failed:', err);
			process.exit(1);
		}
	})();
}
