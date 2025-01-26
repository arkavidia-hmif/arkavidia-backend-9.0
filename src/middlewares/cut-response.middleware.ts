/* eslint-disable */
import { createFactory } from 'hono/factory';

const factory = createFactory();

const removeNestedKeys = (obj: any, keys: string[]) => {
  for (const keyPath of keys) {
    const parts = keyPath.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) {
        break;
      }
      current = current[parts[i]];
    }

    const finalKey = parts[parts.length - 1];
    if (current && current.hasOwnProperty(finalKey)) {
      delete current[finalKey];
    }
  }
};

export const cutResponseMiddleware = (keys: string[]) => {
  return factory.createMiddleware(async (c, next) => {
    await next();
    if (c.res && c.res.body) {
      try {
        const json = await c.res.json();
        removeNestedKeys(json, keys);
        c.res = c.json(json);
      } catch (err) {
        console.error('Failed to modify JSON response:', err);
      }
    }
  });
};
