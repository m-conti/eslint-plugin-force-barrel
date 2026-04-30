import type { TSESLint } from '@typescript-eslint/utils';
import { minimatch } from 'minimatch';

type Options = [{ paths?: string[]; allowedFiles?: string[] }];

const rule: TSESLint.RuleModule<"invalidRootFile", Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce a strict file structure at the root of matching paths.",
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
          allowedFiles: {
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
      invalidRootFile: "Invalid file '{{invalidPart}}' in the root of folder '{{folderName}}'. Allowed files are: {{allowedFilesList}} (and index files).",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const paths = (options.paths && options.paths.length > 0) 
      ? options.paths 
      : ['**/domains/*'];
    const allowedFiles = options.allowedFiles || [];

    const filename = context.filename || context.physicalFilename;
    if (!filename) {
      return {};
    }

    const normalizedFilename = filename.replace(/\\/g, '/');

    // Find if the file is inside a matching folder
    let folderName = null;
    let relativePath = null;

    for (const pattern of paths) {
      const parts = normalizedFilename.split('/');
      for (let i = 0; i <= parts.length; i++) {
        const currentPath = parts.slice(0, i).join('/');
        if (minimatch(currentPath, pattern)) {
          folderName = parts[i - 1]; // The name of the folder itself
          relativePath = parts.slice(i).join('/'); // Whatever comes after the folder
          break;
        }
      }
      if (folderName) break;
    }

    // Only apply this rule to files inside matching folders
    if (!folderName || !relativePath) {
      return {};
    }

    const relativeParts = relativePath.split('/');

    // We only care about files at the root of the folder
    if (relativeParts.length > 1) {
      return {};
    }

    const rootFile = relativeParts[0] as string;

    // index files are always allowed
    if (/^index\.(ts|tsx|js|jsx)$/.test(rootFile)) {
      return {};
    }

    // Check if the file is in the allowed list
    const isAllowed = allowedFiles.some(file => {
      // Exact match or regex match? Let's assume file name or pattern.
      return minimatch(rootFile, file);
    });

    if (!isAllowed) {
      return {
        Program(node) {
          context.report({
            node,
            messageId: "invalidRootFile",
            data: {
              invalidPart: rootFile,
              folderName,
              allowedFilesList: allowedFiles.join(', ') || 'none',
            },
          });
        }
      };
    }

    return {};
  },
};

export default rule;
