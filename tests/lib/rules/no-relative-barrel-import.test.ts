import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import rule from '#lib/rules/no-relative-barrel-import';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('no-relative-barrel-import', rule, {
  valid: [
    {
      code: "import { User } from 'src/domains/users';", // Absolute alias
      filename: '/src/domains/orders/index.ts',
    },
    {
      code: "import { User } from '@/domains/users';", // Alias
      filename: '/src/domains/orders/index.ts',
    },
    {
      code: "import { User } from './components/UserAvatar';", // Internal relative import
      filename: '/src/domains/users/index.ts',
    },
    {
      code: "import { Something } from '../../another/folder';", // Relative but not a domain barrel
      filename: '/src/domains/users/components/index.ts',
    },
    {
      code: "import { User } from '../domains/users';", // In valid path testing, matching against different globs
      options: [{ paths: ["**/features/*"] }],
      filename: '/src/domains/orders/index.ts',
    }
  ],
  invalid: [
    {
      code: "import { User } from '../users';", // Resolves to /src/domains/users which is a barrel
      filename: '/src/domains/orders/index.ts',
      errors: [{ messageId: "noRelativeBarrelImport" }]
    },
    {
      code: "import { User } from '../../domains/users';",
      filename: '/src/domains/orders/components/index.ts',
      errors: [{ messageId: "noRelativeBarrelImport" }]
    },
    {
      code: "import { User } from '../users/index';",
      filename: '/src/domains/orders/index.ts',
      errors: [{ messageId: "noRelativeBarrelImport" }]
    },
    {
      code: "import { User } from '../users/index.ts';",
      filename: '/src/domains/orders/index.ts',
      errors: [{ messageId: "noRelativeBarrelImport" }]
    },
    {
      code: "import { User } from './users';", 
      filename: '/src/domains/index.ts',
      errors: [{ messageId: "noRelativeBarrelImport" }]
    },
  ]
});
