import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import rule from '#lib/rules/no-private-exports';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('no-private-exports', rule, {
  valid: [
    {
      code: "export { API_ENDPOINTS } from './constants/api';",
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "export const PUBLIC_CONST = 10;",
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "export function publicFunction() {}",
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "export { _API_ENDPOINTS } from './constants/api';", // Allowed inside the domain because not an index file
      filename: '/src/domains/users/constants/api.ts',
    },
    {
      code: "export { _API_ENDPOINTS } from './constants/api';",
      options: [{ paths: [".*domains/[^/]+"] }], // A deeper index file isn't the barrel!
      filename: '/src/domains/users/components/index.ts',
    },
    {
      code: "export { _PRIVATE } from './something';",
      options: [{ paths: ["^/src/features/[^/]+"] }], // Not matching domains anymore
      filename: '/src/domains/users/index.ts',
    }
  ],
  invalid: [
    {
      code: "export { _API_ENDPOINTS } from './constants/api';",
      filename: '/src/domains/users/index.ts',
      options: [{ paths: [".*domains/[^/]+"] }], // Explicitly testing default path logic matches
      errors: [{ messageId: "noPrivateExport", data: { exportName: "_API_ENDPOINTS" } }]
    },
    {
      code: "export { _PRIVATE } from './api';",
      filename: '/src/features/cart/index.ts',
      options: [{ paths: ["^/src/features/[^/]+"] }], // Explicitly testing custom path array
      errors: [{ messageId: "noPrivateExport", data: { exportName: "_PRIVATE" } }]
    },
    {
      code: "export { _API_ENDPOINTS } from './constants/api';",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noPrivateExport", data: { exportName: "_API_ENDPOINTS" } }]
    },
    {
      code: "export const _PRIVATE_CONST = 10;",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noPrivateExport", data: { exportName: "_PRIVATE_CONST" } }]
    },
    {
      code: "export function _privateFunction() {}",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noPrivateExport", data: { exportName: "_privateFunction" } }]
    },
    {
      code: "export { API_ENDPOINTS as _API_ENDPOINTS } from './constants/api';",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noPrivateExport", data: { exportName: "_API_ENDPOINTS" } }]
    },
    {
      code: "export { privateVar } from './constants/api';",
      filename: '/src/domains/users/index.ts',
      options: [{ privateRegex: "^private" }],
      errors: [{ messageId: "noPrivateExport", data: { exportName: "privateVar" } }]
    }
  ],
});