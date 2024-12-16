/** Ini buat bikin database schema diagram */

import * as schema from '~/db/schema';
import { pgGenerate } from 'drizzle-dbml-generator';

const out = './docs/schema.dbml';
const relational = true;
pgGenerate({ schema, out, relational });
console.log('✅ Created the schema.dbml file');
console.log('⏳ Creating the erd.svg file');
