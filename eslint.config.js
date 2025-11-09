import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tsconfigPath = path.join(__dirname, "tsconfig.json");
const compat = new FlatCompat({ baseDirectory: __dirname });

/**
 * Light ESLint configuration just for the userscript project.
 */
export default [
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "OpenFrontIO/**"],
  },
  {
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],
    languageOptions: {
      parserOptions: {
        project: tsconfigPath,
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "none",
          varsIgnorePattern: "^_",
        },
      ],
      "no-console": "warn",
    },
  },
];
