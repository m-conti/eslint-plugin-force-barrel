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
      output: "import { a } from './barrel';",
      options: [{ paths: ["./barrel", "./features"], autoFix: true }],
      errors: [{ messageId: "useBarrel" }]
    },
    {
      code: "import { a } from \"./barrel/a\";",
      output: "import { a } from \"./barrel\";",
      options: [{ paths: ["./barrel", "./features"], autoFix: true }],
      errors: [{ messageId: "useBarrel" }]
    },
    {
      code: "import { a } from './barrel/a/b';",
      output: "import { a } from './barrel';",
      options: [{ paths: ["./barrel", "./features"], autoFix: true }],
      errors: [{ messageId: "useBarrel" }]
    },
    {
      code: "import { a } from 'src/domains/users/components/UserAvatar';",
      output: "import { a } from 'src/domains/users';",
      options: [{ autoFix: true }],
      errors: [{ messageId: "useBarrel" }]
    },
    {
      code: "import { a } from './features/core/nested/deep';",
      output: "import { a } from './features';",
      options: [{ paths: ["./barrel", "./features"], autoFix: true }],
      errors: [{ messageId: "useBarrel" }]
    },
    {
      code: "import { a } from './features/core';",
      output: null, // Test without autoFix via omission
      options: [{ paths: ["./barrel", "./features"] }],
      errors: [{ 
        messageId: "useBarrel", 
        suggestions: [{ messageId: "replaceWithBarrel", output: "import { a } from './features';" }] 
      }]
    },
    {
      code: "import { a } from './features/core';",
      output: null, // Test explicit autoFix: false
      options: [{ paths: ["./barrel", "./features"], autoFix: false }],
      errors: [{ 
        messageId: "useBarrel", 
        suggestions: [{ messageId: "replaceWithBarrel", output: "import { a } from './features';" }] 
      }]
    }
  ],
});