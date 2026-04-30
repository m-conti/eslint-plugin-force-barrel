import type { TSESLint } from '@typescript-eslint/utils';
import { minimatch } from 'minimatch';

type Options = [{ paths?: string[] }];

const rule: TSESLint.RuleModule<"noDeclaration", Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow declarations in barrel files.",
    },
    schema: [
      {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noDeclaration: "Declarations are not allowed in barrel files. Use another file and export it here.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const paths = (options.paths && options.paths.length > 0) 
      ? options.paths 
      : ['**/domains/*'];

    const filename = context.filename || context.physicalFilename;
    if (!filename) {
      return {};
    }

    const normalizedFilename = filename.replace(/\\/g, '/');

    const isBarrel = paths.some((pattern: string) =>
      minimatch(normalizedFilename, `${pattern.replace(/\/$/, '')}/index.{ts,tsx,js,jsx}`)
    );

    // Only apply this rule to the matched barrel files
    if (!isBarrel) {
      return {};
    }

    const report = (node: any) => {
      context.report({
        node,
        messageId: "noDeclaration",
      });
    };

    return {
      VariableDeclaration: report,
      FunctionDeclaration: report,
      ClassDeclaration: report,
      TSTypeAliasDeclaration: report,
      TSInterfaceDeclaration: report,
      TSEnumDeclaration: report,
      TSModuleDeclaration: report,
    };
  },
};

export default rule;
