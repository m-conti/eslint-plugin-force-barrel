/**
 * @fileoverview Force barrel exports
 * @author ESLint Plugin
 */
import type { TSESLint } from '@typescript-eslint/utils';

type Options = [{ paths: string[] }];

const rule: TSESLint.RuleModule<"useBarrel", Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "Force imports from barrel files",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      useBarrel: "Import from the barrel file '{{barrelPath}}' instead of reaching into '{{importPath}}'.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const paths = (options.paths && options.paths.length > 0) 
      ? options.paths 
      : ['.*domains/[^/]+'];
    const prefixRegexes = paths.map((p: string) => new RegExp(p));

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== 'string') return;

        for (const prefixRegex of prefixRegexes) {
          const match = importPath.match(prefixRegex);
          if (!match) continue;

          const remainder = importPath.slice(match.index! + match[0].length);
          if (remainder.length > 0 && remainder.startsWith('/')) {
            context.report({
              node,
              messageId: "useBarrel",
              data: {
                barrelPath: match[0],
                importPath
              }
            });
            return;
          }
        }
      }
    };
  },
};

export default rule;
