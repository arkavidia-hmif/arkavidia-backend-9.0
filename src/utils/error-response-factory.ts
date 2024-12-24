import type { ResponseConfig } from '@asteasolutions/zod-to-openapi/dist/openapi-registry.js';
import { z } from 'zod';

import {
  GenericErrorShema,
  ValidationErrorSchema,
} from '../types/responses.type';

const typeToSchema = (error: 'GENERIC' | 'VALIDATION' | 'UNION') => {
  if (error === 'GENERIC') return GenericErrorShema;
  if (error === 'VALIDATION') return ValidationErrorSchema;
  if (error === 'UNION')
    return z.union([GenericErrorShema, ValidationErrorSchema]);
};

export const createErrorResponse = (
  error: 'GENERIC' | 'VALIDATION' | 'UNION',
  description: string,
) => {
  return {
    description,
    content: {
      'application/json': {
        schema: typeToSchema(error),
      },
    },
  } as ResponseConfig;
};
