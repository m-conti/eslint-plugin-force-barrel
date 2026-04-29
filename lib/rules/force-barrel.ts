/**
 * @fileoverview Force barrel exports
 * @author ESLint Plugin
 */
import type { TSESLint } from '@typescript-eslint/utils';
import { minimatch } from 'minimatch';

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
      : ['**/domains/*'];

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
                context.report({
                  node,
                  messageId: "useBarrel",
                  data: {
                    barrelPath: currentPath,
                    importPath
                  }
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
