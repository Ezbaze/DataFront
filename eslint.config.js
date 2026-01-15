import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
});

const tsFiles = [
  "src/**/*.{ts,tsx}",
  "tooling/**/*.{ts,tsx}",
  "tests/**/*.{ts,tsx}",
  "generated/**/*.{ts,tsx}",
  "resources/**/*.{ts,tsx}",
];

const tsCompatEntries = compat.config({
  overrides: [
    {
      files: tsFiles,
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: path.join(__dirname, "tsconfig.eslint.json"),
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
      plugins: ["@typescript-eslint"],
      extends: "plugin:@typescript-eslint/recommended",
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            args: "none",
            varsIgnorePattern: "^_",
          },
        ],
        "@typescript-eslint/no-require-imports": "off",
      },
    },
  ],
});

export default [
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "OpenFrontIO/**"],
  },
  ...compat.extends("eslint:recommended"),
  ...compat.env({ es2022: true, node: true }),
  ...tsCompatEntries,
  eslintConfigPrettier,
  {
    rules: {
      "no-console": "warn",
    },
  },
  {
    files: ["scripts/**/*.{js,cjs}"],
    rules: {
      "no-undef": "off",
      "no-console": "off",
    },
  },
];
