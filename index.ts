import forceBarrel from "./lib/rules/force-barrel.js";
import noPrivateExports from "./lib/rules/no-private-exports.js";
import noBarrelDeclaration from "./lib/rules/no-barrel-declaration.js";
import noRelativeBarrelImport from "./lib/rules/no-relative-barrel-import.js";
import strictFolderStructure from "./lib/rules/strict-folder-structure.js";
import strictFileStructure from "./lib/rules/strict-file-structure.js";

const plugin = {
  rules: {
    "force-barrel": forceBarrel,
    "no-private-exports": noPrivateExports,
    "no-barrel-declaration": noBarrelDeclaration,
    "no-relative-barrel-import": noRelativeBarrelImport,
    "strict-folder-structure": strictFolderStructure,
    "strict-file-structure": strictFileStructure,
  },
};

export const rules = plugin.rules;

export const configs = {
  recommended: {
    plugins: {
      "force-barrel": plugin,
    },
    rules: {
      "force-barrel/force-barrel": "error",
      "force-barrel/no-private-exports": "error",
      "force-barrel/no-barrel-declaration": "error",
      "force-barrel/no-relative-barrel-import": "error",
      "force-barrel/strict-file-structure": "error",
    },
  },
};

export default plugin;
