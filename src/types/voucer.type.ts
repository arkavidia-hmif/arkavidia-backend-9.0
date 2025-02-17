import { createSelectSchema } from 'drizzle-zod';
import { voucer } from '~/db/schema/voucer.schema';

export const VoucerSchema = createSelectSchema(voucer).openapi('Voucer');
