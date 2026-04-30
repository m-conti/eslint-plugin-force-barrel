import type { TSESLint } from '@typescript-eslint/utils';
import { minimatch } from 'minimatch';
import path from 'path';

type Options = [{ paths?: string[] }];

const rule: TSESLint.RuleModule<"noRelativeBarrelImport", Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow relative imports to barrel files.",
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
      noRelativeBarrelImport: "Relative imports to a barrel file are not allowed. Use an absolute path or alias instead.",
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

    const dirname = path.dirname(filename);

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== 'string') return;

        // Check if the import path is relative
        if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
          return;
        }

        // Resolve the absolute target path
        const absoluteTarget = path.resolve(dirname, importPath).replace(/\\/g, '/');

        // Check if the absolute target matches any of the barrel patterns
        for (const pattern of paths) {
          const isBarrelFolder = minimatch(absoluteTarget, pattern);
          const isBarrelIndex = minimatch(absoluteTarget, `${pattern.replace(/\/$/, '')}/index`) || 
                                minimatch(absoluteTarget, `${pattern.replace(/\/$/, '')}/index.{ts,tsx,js,jsx}`);

          if (isBarrelFolder || isBarrelIndex) {
            context.report({
              node,
              messageId: "noRelativeBarrelImport",
            });
            return;
          }
        }
      }
    };
  },
};

export default rule;
