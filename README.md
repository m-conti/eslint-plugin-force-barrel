# eslint-plugin-force-barrel

[![npm](https://img.shields.io/npm/v/eslint-plugin-force-barrel)](https://www.npmjs.com/package/eslint-plugin-force-barrel)
[![license](https://img.shields.io/github/license/m-conti/eslint-plugin-force-barrel)](https://github.com/m-conti/eslint-plugin-force-barrel/blob/main/LICENSE)
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
      "force-barrel/no-private-exports": [
        "error",
        {
          paths: [".*domains/[^/]+"],          // Same regex as above
          privateRegex: "^_"                   // Regex identifying private exports (default: "^_")
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
    ],
    "force-barrel/no-private-exports": [
      "error",
      {
        "paths": [".*domains/[^/]+"],
        "privateRegex": "^_"
      }
    ]
  }
}
```

## Rules

This plugin currently provides two core rules:

### 1. `force-barrel`

Enforces that imports from a domain strictly target the domain's public index (barrel) file instead of reaching deep into its folder structure.

If no `paths` configuration is defined, the rule falls back to its default behavior, targeting domains: `['.*domains/[^/]+']`. 

If an import statement resolves to a folder matched by one of your `paths` regexes but additionally includes a deeper slashes path, this rule will trigger an error preventing developers from bypassing the domain's public index boundary.

#### ✔️ Correct

```javascript
/* eslint force-barrel/force-barrel: ["error", { paths: [".*domains/[^/]+"] }] */

// Importing cleanly from the barrel boundary
import { UserAvatar } from 'src/domains/users';
import { CustomerAPI } from './domains/customer';
```

#### ❌ Incorrect

```javascript
/* eslint force-barrel/force-barrel: ["error", { paths: [".*domains/[^/]+"] }] */

// Bypassing the barrel boundary by going deep into the domain folder
import { UserAvatar } from 'src/domains/users/components/UserAvatar';
import { Utils } from './domains/customer/utils';
```

### 2. `no-private-exports`

Enforces that internal variables (e.g. constants, helpers) prefixed with a specific identifying pattern (like `_`) cannot be exported from your public domain interface (`index.ts`).

This rule exclusively runs inside matching barrel index files (based on your `paths` configuration) ensuring the public boundary stays clean while allowing internal shared usage of those private variables *within* the domain.

**Parameters:**
- `paths`: Array of regex strings describing your barrel structures (Default: `['.*domains/[^/]+']`).
- `privateRegex`: Regex pattern to identify local private exports (Default: `"^"` - e.g. variables starting with an underscore).

#### ✔️ Correct (Internal files can export privates)
```typescript
/* filename: src/domains/users/constants/api.ts */

// Free to export and share inside the domain!
export const _API_ENDPOINTS = { GET: '/a' };
```

#### ✔️ Correct (Barrel files can export public modules)
```typescript
/* filename: src/domains/users/index.ts */

export { UserAvatar } from './components/UserAvatar';
export function publicHelper() {}
```

#### ❌ Incorrect (Barrel files CANNOT export private modules)
```typescript
/* filename: src/domains/users/index.ts */

// Busted! A private variable shouldn't leak from the public interface.
export { _API_ENDPOINTS } from './constants/api';
export function _privateHelper() {}
```
