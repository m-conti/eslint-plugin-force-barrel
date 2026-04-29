import forceBarrel from "./lib/rules/force-barrel.js";
import noPrivateExports from "./lib/rules/no-private-exports.js";

const plugin = {
  rules: {
    "force-barrel": forceBarrel,
    "no-private-exports": noPrivateExports,
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
    },
  },
};

export default plugin;
