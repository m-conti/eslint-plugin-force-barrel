import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import rule from '#lib/rules/strict-folder-structure';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

const defaultOptions: any = [{ allowedFolders: ['components', 'utils', 'types', 'api', 'constants', 'hooks'] }];

ruleTester.run('strict-folder-structure', rule, {
  valid: [
    {
      code: "export { User } from './components/User';",
      options: defaultOptions,
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "export const C = 1;",
      options: defaultOptions,
      filename: '/src/domains/users/components/User.tsx',
    },
    {
      code: "export const U = 1;",
      options: defaultOptions,
      filename: '/src/domains/users/utils/index.ts',
    },
    {
      code: "export const A = 1;",
      options: defaultOptions,
      filename: '/src/domains/users/api/index.ts',
    },
    {
      code: "export const T = 1;",
      options: defaultOptions,
      filename: '/src/domains/users/types/user.ts',
    },
    {
      code: "export const H = 1;",
      options: defaultOptions,
      filename: '/src/domains/users/hooks/useUser.ts',
    },
    {
      code: "export const C = 1;",
      options: defaultOptions,
      filename: '/src/domains/users/constants/index.ts',
    },
    {
      code: "export const X = 1;",
      options: [{ paths: ['**/domains/*'], allowedFolders: ['custom'] }],
      filename: '/src/domains/users/custom/index.ts',
    },
    {
      code: "export const outside = 1;",
      options: defaultOptions,
      filename: '/src/other/folder/someSubfolder/file.ts', // Not a domain
    },
    {
      code: "export const user = 1;",
      options: [{ paths: ['**/features/*'] }],
      filename: '/src/domains/users/someSubfolder/file.ts', // Not matching paths override
    }
  ],
  invalid: [
    {
      code: "export const O = 1;",
      options: defaultOptions,
      filename: '/src/domains/orders/other/file.ts',
      errors: [{ messageId: "invalidSubfolder", data: { invalidPart: 'other', folderName: 'orders', allowedFoldersList: 'components, utils, types, api, constants, hooks' } }],
    },
    {
      code: "export const X = 1;",
      options: [{ paths: ['**/domains/*'], allowedFolders: ['custom'] }],
      filename: '/src/domains/users/components/index.ts', // components not in allowedFolders override
      errors: [{ messageId: "invalidSubfolder", data: { invalidPart: 'components', folderName: 'users', allowedFoldersList: 'custom' } }],
    },
    {
      code: "export const F = 1;",
      options: [{ paths: ['**/domains/*'] }], // no allowedFolders provided, defaults to []
      filename: '/src/domains/users/anyFolder/index.ts',
      errors: [{ messageId: "invalidSubfolder", data: { invalidPart: 'anyFolder', folderName: 'users', allowedFoldersList: 'none' } }],
    }
  ],
});
