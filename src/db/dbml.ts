/** Ini buat bikin database schema diagram */

import { pgGenerate } from 'drizzle-dbml-generator';
import * as schema from '~/db/schema';

const out = './docs/schema.dbml';
const relational = true;
pgGenerate({ schema, out, relational });
console.log('✅ Created the schema.dbml file');
console.log('⏳ Creating the erd.svg file');
