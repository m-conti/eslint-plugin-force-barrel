import { RuleTester } from '@typescript-eslint/rule-tester';
import * as parser from '@typescript-eslint/parser';
import rule from '#lib/rules/force-barrel';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('force-barrel', rule, {
  valid: [
    {
      code: "import { a } from './barrel';",
      options: [{ paths: ["./barrel", "./features"] }]
    },
    {
      code: "import { a } from './other';",
      options: [{ paths: ["./barrel", "./features"] }]
    },
    {
      code: "import { a } from './features';",
      options: [{ paths: ["./barrel", "./features"] }]
    },
    {
      code: "import { a } from 'src/domains/users';",
    }
  ],
  invalid: [
    {
      code: "import { a } from './barrel/a';",
      options: [{ paths: ["./barrel", "./features"] }],
      errors: [{ messageId: "useBarrel" }]
    },
    {
      code: "import { a } from './barrel/a/b';",
      options: [{ paths: ["./barrel", "./features"] }],
      errors: [{ messageId: "useBarrel" }]
    },
    {
      code: "import { a } from 'src/domains/users/components/UserAvatar';",
      errors: [{ messageId: "useBarrel" }]
    },
    {
      code: "import { a } from './features/core';",
      options: [{ paths: ["./barrel", "./features"] }],
      errors: [{ messageId: "useBarrel" }]
    }
  ],
});