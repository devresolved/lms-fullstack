import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/*", "node_modules/*"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "app/**/*.ts",
      "app/*.tsx",
      "*.ts",
      "*.tsx",
      "db/**/*.ts",
      "db/*.ts",
      "lib/**/*.{ts,tsx}",
      "lib/*.{ts,tsx}",
    ],
    plugins: {
      "@typescript-eslint": typescript,
      import: importPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      // TypeScript rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"],
        },
        {
          selector: "enum",
          format: ["PascalCase"],
          prefix: ["E"],
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
          prefix: ["T"],
        },
      ],
      // Code style
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      // Import Rules
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling"], "index"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/no-duplicates": "warn",
      "import/extensions": ["warn", "ignorePackages", { ts: "never", tsx: "never" }],
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },
];

export default eslintConfig;
