import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

const nodeGlobals = {
  console: "readonly",
  process: "readonly",
  URL: "readonly",
};

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
);
