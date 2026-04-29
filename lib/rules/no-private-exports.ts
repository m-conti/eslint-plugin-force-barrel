import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type Options = [{ privateRegex?: string; paths?: string[] }];

const rule: TSESLint.RuleModule<"noPrivateExport", Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow exporting private variables from barrel files.",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          privateRegex: {
            type: "string",
          },
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
      noPrivateExport: "Exporting private variable '{{exportName}}' is not allowed.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const privateRegexString = options.privateRegex || "^_";
    const privateRegex = new RegExp(privateRegexString);
    const paths = (options.paths && options.paths.length > 0) 
      ? options.paths 
      : ['.*domains/[^/]+'];
    const pathRegexes = paths.map((p: string) => new RegExp(p));

    const filename = context.filename || context.physicalFilename;
    if (!filename) {
      return {};
    }

    const normalizedFilename = filename.replace(/\\/g, '/');
    let isBarrel = false;
    for (const regex of pathRegexes) {
      const match = normalizedFilename.match(regex);
      if (match) {
        const remainder = normalizedFilename.slice(match.index! + match[0].length);
        if (/^\/index\.(ts|tsx|js|jsx)$/i.test(remainder)) {
          isBarrel = true;
          break;
        }
      }
    }

    // Only apply this rule to the matched barrel files
    if (!isBarrel) {
      return {};
    }

    return {
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        const exportsToCheck: { name: string; locNode: TSESTree.Node }[] = [];

        // Handle `export { _API_ENDPOINTS }`
        for (const specifier of node.specifiers) {
          const exportName = specifier.exported.type === 'Identifier' 
            ? specifier.exported.name 
            : specifier.exported.value;
          
          if (typeof exportName === 'string') {
            exportsToCheck.push({ name: exportName, locNode: specifier });
          }
        }

        // Handle `export const _API_ENDPOINTS = ...` or `export function _foo() {}`
        if (node.declaration) {
          if (node.declaration.type === 'VariableDeclaration') {
            for (const decl of node.declaration.declarations) {
              if (decl.id.type === 'Identifier') {
                exportsToCheck.push({ name: decl.id.name, locNode: decl.id });
              }
            }
          } else if ('id' in node.declaration && node.declaration.id?.type === 'Identifier') {
            exportsToCheck.push({ name: node.declaration.id.name, locNode: node.declaration.id });
          }
        }

        // Report any exports matching the private regex
        for (const { name, locNode } of exportsToCheck) {
          if (privateRegex.test(name)) {
            context.report({
              node: locNode,
              messageId: "noPrivateExport",
              data: { exportName: name },
            });
          }
        }
      },
    };
  },
};

export default rule;