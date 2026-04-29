# eslint-plugin-force-barrel

[![npm](https://img.shields.io/npm/v/eslint-plugin-force-barrel)](https://www.npmjs.com/package/eslint-plugin-force-barrel)
[![license](https://img.shields.io/github/license/m-conti/force-barrel)](https://github.com/m-conti/force-barrel/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/min/eslint-plugin-force-barrel)](https://bundlephobia.com/package/eslint-plugin-force-barrel)

An ESLint plugin to enforce importing from barrel files (indexes) instead of reaching deep into internal folder structures.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-force-barrel`:

```sh
npm install eslint-plugin-force-barrel --save-dev
```

## Usage

### Flat Config (ESLint >= 9)

In your `eslint.config.js`:

```javascript
import forceBarrelPlugin from "eslint-plugin-force-barrel";

export default [
  {
    plugins: {
      "force-barrel": forceBarrelPlugin,
    },
    rules: {
      "force-barrel/force-barrel": [
        "error",
        {
          paths: [
            // List of regex patterns identifying your barrel folders
            ".*domains/[^/]+",
          ],
        },
      ],
    },
  },
];
```

### Legacy Config (`.eslintrc`)

Add `force-barrel` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["force-barrel"],
  "rules": {
    "force-barrel/force-barrel": [
      "error",
      {
        "paths": [".*domains/[^/]+"]
      }
    ]
  }
}
```

## Rule Details

If no `paths` configuration is defined, the rule falls back to its default behavior, targeting domains: `['.*domains/[^/]+']`. 

If an import statement resolves to a folder matched by one of your regexes but additionally includes a deeper slashes path, this rule will trigger an error preventing developers from bypassing the domain's public index boundary.

### ✔️ Correct

```javascript
/* eslint force-barrel/force-barrel: ["error", { paths: [".*domains/[^/]+"] }] */

// Importing cleanly from the barrel boundary
import { UserAvatar } from 'src/domains/users';
import { CustomerAPI } from './domains/customer';
```

### ❌ Incorrect

```javascript
/* eslint force-barrel/force-barrel: ["error", { paths: [".*domains/[^/]+"] }] */

// Bypassing the barrel boundary by going deep into the domain folder
import { UserAvatar } from 'src/domains/users/components/UserAvatar';
import { Utils } from './domains/customer/utils';
```
