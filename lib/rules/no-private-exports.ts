import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { minimatch } from 'minimatch';

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

    const checkAndReport = (name: string, locNode: TSESTree.Node) => {
      if (privateRegex.test(name)) {
        context.report({
          node: locNode,
          messageId: "noPrivateExport",
          data: { exportName: name },
        });
      }
    };

    return {
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        // Handle `export { _API_ENDPOINTS }`
        for (const spec of node.specifiers) {
          const exportName = spec.exported.type === 'Identifier' 
            ? spec.exported.name 
            : spec.exported.value;
          
          if (typeof exportName === 'string') checkAndReport(exportName, spec);
        }

        if (!node.declaration) return;

        // Handle `export const _API_ENDPOINTS = ...`
        if (node.declaration.type === 'VariableDeclaration') {
          for (const decl of node.declaration.declarations) {
            if (decl.id.type === 'Identifier') checkAndReport(decl.id.name, decl.id);
          }
          return;
        }

        // Handle `export function _foo() {}`
        if ('id' in node.declaration && node.declaration.id?.type === 'Identifier') {
          checkAndReport(node.declaration.id.name, node.declaration.id);
        }
      },
    };
  },
};

export default rule;