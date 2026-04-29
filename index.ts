import forceBarrel from "./lib/rules/force-barrel";
import noPrivateExports from "./lib/rules/no-private-exports";

export const rules = {
  "force-barrel": forceBarrel,
  "no-private-exports": noPrivateExports,
};

export const configs = {
  recommended: {
    plugins: ["force-barrel"],
    rules: {
      "force-barrel/force-barrel": "error",
      "force-barrel/no-private-exports": "error",
    },
  },
};
