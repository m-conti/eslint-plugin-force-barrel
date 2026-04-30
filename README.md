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

### Recommended Config

You can use the recommended configuration, which enables all the plugin's rules as errors.

**Flat Config (ESLint >= 9)**

```javascript
import forceBarrelPlugin from "eslint-plugin-force-barrel";

export default [
  forceBarrelPlugin.configs.recommended,
];
```

**Legacy Config (`.eslintrc`)**

```json
{
  "extends": ["plugin:force-barrel/recommended"]
}
```

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
            // List of glob patterns identifying your barrel folders
            "**/domains/*",
          ],
        },
      ],
      "force-barrel/no-private-exports": [
        "error",
        {
          paths: ["**/domains/*"],          // Same glob pattern as above
          privateRegex: "^_"                   // Regex identifying private exports (default: "^_")
        },
      ],
      "force-barrel/no-barrel-declaration": [
        "error",
        {
          paths: ["**/domains/*"]
        },
      ],
      "force-barrel/no-relative-barrel-import": [
        "error",
        {
          paths: ["**/domains/*"]
        },
      ],
      "force-barrel/strict-folder-structure": [
        "error",
        {
          paths: ["**/domains/*"],
          allowedFolders: ["components", "utils", "types", "api", "constants", "hooks"]
        },
      ],
      "force-barrel/strict-file-structure": [
        "error",
        {
          paths: ["**/domains/*"],
          allowedFiles: []
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
        "paths": ["**/domains/*"]
      }
    ],
    "force-barrel/no-private-exports": [
      "error",
      {
        "paths": ["**/domains/*"],
        "privateRegex": "^_"
      }
    ],
    "force-barrel/no-barrel-declaration": [
      "error",
      {
        "paths": ["**/domains/*"]
      }
    ],
    "force-barrel/no-relative-barrel-import": [
      "error",
      {
        "paths": ["**/domains/*"]
      }
    ],
    "force-barrel/strict-folder-structure": [
      "error",
      {
        "paths": ["**/domains/*"],
        "allowedFolders": ["components", "utils", "types", "api", "constants", "hooks"]
      }
    ],
    "force-barrel/strict-file-structure": [
      "error",
      {
        "paths": ["**/domains/*"],
        "allowedFiles": []
      }
    ]
  }
}
```

## Rules

This plugin currently provides six core rules:

### 1. `force-barrel`

Enforces that imports from a domain strictly target the domain's public index (barrel) file instead of reaching deep into its folder structure.

If no `paths` configuration is defined, the rule falls back to its default behavior, targeting domains: `['**/domains/*']`. 

If an import statement resolves to a folder matched by one of your `paths` globs but additionally includes a deeper slashes path, this rule will trigger an error preventing developers from bypassing the domain's public index boundary.

**Parameters:**
- `paths` (optional): Array of glob strings describing your barrel structures (Default: `['**/domains/*']`).
- `autoFix` (optional): Boolean. If set to `true`, the rule will automatically fix imports to point to the barrel file during `eslint --fix`. Note: use with caution as it might break imports if the target isn't actually exported by the barrel file. Default is `false` (it will provide an editor suggestion instead of an auto-fix).

#### ✔️ Correct

```javascript
/* eslint force-barrel/force-barrel: ["error", { paths: ["**/domains/*"], autoFix: false }] */

// Importing cleanly from the barrel boundary
import { UserAvatar } from 'src/domains/users';
import { CustomerAPI } from './domains/customer';
```

#### ❌ Incorrect

```javascript
/* eslint force-barrel/force-barrel: ["error", { paths: ["**/domains/*"] }] */

// Bypassing the barrel boundary by going deep into the domain folder
import { UserAvatar } from 'src/domains/users/components/UserAvatar';
import { Utils } from './domains/customer/utils';
```

### 2. `no-private-exports`

Enforces that internal variables (e.g. constants, helpers) prefixed with a specific identifying pattern (like `_`) cannot be exported from your public domain interface (`index.ts`).

This rule exclusively runs inside matching barrel index files (based on your `paths` configuration) ensuring the public boundary stays clean while allowing internal shared usage of those private variables *within* the domain.

**Parameters:**
- `paths`: Array of glob strings describing your barrel structures (Default: `['**/domains/*']`).
- `privateRegex`: Regex pattern to identify local private exports (Default: `"^_"` - e.g. variables starting with an underscore).

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

### 3. `no-barrel-declaration`

Enforces that no local declarations (variables, functions, classes, types, etc.) are present inside your public domain interface (`index.ts`).
Barrel files should strictly re-export modules defined in other files rather than declaring any logic directly.

**Parameters:**
- `paths`: Array of glob strings describing your barrel structures (Default: `['**/domains/*']`).

#### ✔️ Correct (Barrel files strictly re-export logic)
```typescript
/* filename: src/domains/users/index.ts */

export { UserAvatar } from './components/UserAvatar';
export * from './constants/api';
```

#### ❌ Incorrect (Barrel files CANNOT declare logic directly)
```typescript
/* filename: src/domains/users/index.ts */

// Declarations inside the barrel are not allowed! Move logic to a separate file and export it instead.
export const LOCAL_VALUE = 42;
export function helper() {}
class Service {}
```

### 4. `no-relative-barrel-import`

Enforces that barrel files cannot be imported using relative paths (e.g. `../domains/user` or `./domains/user`).
You should use absolute paths or aliases (e.g. `src/domains/user` or `@/domains/user`) when importing domains to keep paths clean and refactoring-friendly.

**Parameters:**
- `paths`: Array of glob strings describing your barrel structures (Default: `['**/domains/*']`).

#### ✔️ Correct
```typescript
/* filename: src/domains/orders/index.ts */

// Using absolute path or alias
import { UserAvatar } from 'src/domains/users';
import { UserAvatar } from '@/domains/users';
```

#### ❌ Incorrect
```typescript
/* filename: src/domains/orders/index.ts */

// Using relative paths to jump across domains
import { UserAvatar } from '../users';
import { UserAvatar } from '../../domains/users';
```

### 5. `strict-folder-structure`

Enforces a specific folder structure inside your domain directories. If any subfolder is created that is not part of the `allowedFolders` array, the rule will flag it. Files placed directly at the root of the domain folder (like `index.ts`) are evaluated by `strict-file-structure` instead.

**Parameters:**
- `paths`: Array of glob strings describing your barrel structures (Default: `['**/domains/*']`).
- `allowedFolders`: Array of allowed folder names at the top root of the matched domain folders (Default: `[]`).

#### ✔️ Correct
```typescript
/* allowedFolders: ["components", "utils"] */
/* files: */
/* src/domains/users/components/UserAvatar.tsx */
/* src/domains/users/utils/index.ts */
/* src/domains/users/index.ts */ // Handled by strict-file-structure or allowed
```

#### ❌ Incorrect
```typescript
/* allowedFolders: ["components", "utils"] */
/* files: */
/* src/domains/users/services/api.ts */ // 🚨 "services" is not an allowed folder!
```

### 6. `strict-file-structure`

Enforces that only whitelisted file names are allowed strictly at the root of the domain directory. Notice that `index.*` files are ignored and always allowed. Any file placed inside an allowed nested folder is bypassed by this rule.

**Parameters:**
- `paths`: Array of glob strings describing your barrel structures (Default: `['**/domains/*']`).
- `allowedFiles`: Array of allowed file names at the exact matched root directory (Default: `[]`).

#### ✔️ Correct
```typescript
/* allowedFiles: ["types.ts", "constants.ts"] */
/* files: */
/* src/domains/users/index.ts */ // Always allowed implicitly
/* src/domains/users/types.ts */
/* src/domains/users/constants.ts */
```

#### ❌ Incorrect
```typescript
/* allowedFiles: ["types.ts", "constants.ts"] */
/* files: */
/* src/domains/users/helper.ts */ // 🚨 "helper.ts" is not explicitly allowed in the array!
```
