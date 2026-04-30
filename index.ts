import forceBarrel from "./lib/rules/force-barrel.js";
import noPrivateExports from "./lib/rules/no-private-exports.js";
import noBarrelDeclaration from "./lib/rules/no-barrel-declaration.js";
import noRelativeBarrelImport from "./lib/rules/no-relative-barrel-import.js";

const plugin = {
  rules: {
    "force-barrel": forceBarrel,
    "no-private-exports": noPrivateExports,
    "no-barrel-declaration": noBarrelDeclaration,
    "no-relative-barrel-import": noRelativeBarrelImport,
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
    },
  },
};

export default plugin;
