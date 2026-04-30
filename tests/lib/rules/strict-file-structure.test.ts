import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import rule from '#lib/rules/strict-file-structure';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('strict-file-structure', rule, {
  valid: [
    {
      code: "export { User } from './components/User';",
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "export const H = 1;",
      options: [{ allowedFiles: ['helper.ts'] }],
      filename: '/src/domains/users/helper.ts',
    },
    {
      code: "export const O = 1;",
      // Files inside subfolders are ignored by THIS rule
      filename: '/src/domains/orders/other/file.ts', 
    }
  ],
  invalid: [
    {
      code: "export const H = 1;",
      filename: '/src/domains/users/helper.ts',
      errors: [{ messageId: "invalidRootFile", data: { invalidPart: 'helper.ts', folderName: 'users', allowedFilesList: 'none' } }],
    },
    {
      code: "export const A = 1;",
      options: [{ allowedFiles: ['helper.ts'] }],
      filename: '/src/domains/users/api.ts',
      errors: [{ messageId: "invalidRootFile", data: { invalidPart: 'api.ts', folderName: 'users', allowedFilesList: 'helper.ts' } }],
    }
  ],
});
