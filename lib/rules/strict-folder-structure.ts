import type { TSESLint } from '@typescript-eslint/utils';
import { minimatch } from 'minimatch';

type Options = [{ paths?: string[]; allowedFolders?: string[] }];

const rule: TSESLint.RuleModule<"invalidSubfolder", Options> = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce a strict folder structure inside matching paths.",
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
          allowedFolders: {
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
      invalidSubfolder: "Invalid folder '{{invalidPart}}' inside folder '{{folderName}}'. Allowed subfolders are: {{allowedFoldersList}}.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const paths = (options.paths && options.paths.length > 0) 
      ? options.paths 
      : ['**/domains/*'];
    const allowedFolders = options.allowedFolders || [];

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

    // `relativePath` might be e.g., "index.ts" or "components/Avatar.tsx" or "helper.ts"
    const relativeParts = relativePath.split('/');

    // If it's a file at the root of the matched folder, we don't care (handled by strict-file-structure)
    if (relativeParts.length === 1) {
      return {}; 
    }

    // If it's inside a subfolder, the first subfolder MUST be in the allowedFolders list
    const firstSubfolder = relativeParts[0] as string;
    if (!allowedFolders.includes(firstSubfolder)) {
      return {
        Program(node) {
          context.report({
            node,
            messageId: "invalidSubfolder",
            data: {
              invalidPart: firstSubfolder,
              folderName,
              allowedFoldersList: allowedFolders.join(', ') || 'none',
            },
          });
        }
      };
    }

    return {};
  },
};

export default rule;
