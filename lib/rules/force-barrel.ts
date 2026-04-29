/**
 * @fileoverview Force barrel exports
 * @author ESLint Plugin
 */
import type { TSESLint } from '@typescript-eslint/utils';
import { minimatch } from 'minimatch';

type Options = [{ paths?: string[], autoFix?: boolean }];

const rule: TSESLint.RuleModule<"useBarrel" | "replaceWithBarrel", Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "Force imports from barrel files",
    },
    fixable: "code",
    hasSuggestions: true,
    schema: [
      {
        type: "object",
        properties: {
          paths: {
            type: "array",
            items: {
              type: "string"
            }
          },
          autoFix: {
            type: "boolean"
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      useBarrel: "Import from the barrel file '{{barrelPath}}' instead of reaching into '{{importPath}}'.",
      replaceWithBarrel: "Replace with barrel import",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const paths = (options.paths && options.paths.length > 0) 
      ? options.paths 
      : ['**/domains/*'];
    const autoFixEnabled = options.autoFix === true;

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== 'string') return;

        const parts = importPath.split('/');
        
        for (const pattern of paths) {
          for (let i = 0; i < parts.length; i++) {
            const currentPath = parts.slice(0, i + 1).join('/');
            
            if (minimatch(currentPath, pattern)) {
              const remainingParts = parts.slice(i + 1);
              
              if (remainingParts.length > 0) {
                const quote = node.source.raw?.charAt(0) || "'";
                const buildFix = (fixer: TSESLint.RuleFixer) => fixer.replaceText(node.source, `${quote}${currentPath}${quote}`);

                context.report({
                  node,
                  messageId: "useBarrel",
                  data: {
                    barrelPath: currentPath,
                    importPath
                  },
                  ...(autoFixEnabled ? {
                    fix: buildFix
                  } : {
                    suggest: [
                      {
                        messageId: "replaceWithBarrel",
                        fix: buildFix
                      }
                    ]
                  })
                });
                return;
              }
            }
          }
        }
      }
    };
  },
};

export default rule;
