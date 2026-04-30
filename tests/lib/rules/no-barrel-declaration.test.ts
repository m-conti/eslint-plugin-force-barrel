import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import rule from '#lib/rules/no-barrel-declaration';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('no-barrel-declaration', rule, {
  valid: [
    {
      code: "export { Something } from './something';",
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "export * from './something';",
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "import { Something } from './something';", // Imports directly without exporting
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "const A = 1; export { A };",
      filename: '/src/domains/users/not-barrel.ts', // Not a barrel file
    },
    {
      code: "function doSomething() {}",
      filename: '/src/domains/users/not-barrel.ts',
    },
    {
      code: "const A = 1;",
      options: [{ paths: ["/src/features/*"] }],
      filename: '/src/domains/users/index.ts', // Because paths option does not match domains
    }
  ],
  invalid: [
    {
      code: "const A = 1;",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "export const A = 1;",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "function A() {}",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "export function A() {}",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "class A {}",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "export class A {}",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "interface A {}",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "type A = string;",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "enum A { B }",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "module A {}",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    },
    {
      code: "namespace A {}",
      filename: '/src/domains/users/index.ts',
      errors: [{ messageId: "noDeclaration" }]
    }
  ]
});
