import playwright from "eslint-plugin-playwright";
import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
    // Ignore files and directories (replaces .eslintignore)
    {
        ignores: ["node_modules", "dist", "playwright-report", "test-results", "test-data"],
    },
    eslint.configs.recommended,
    // Prettier configuration (should be last to override other formatting rules)
    prettierConfig,
    // ESLint rules for TypeScript files
    {
        files: ["**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslint,
            import: importPlugin,
            prettier: prettierPlugin,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                project: "./tsconfig.json",
            },
            globals: {
                console: "readonly",
                process: "readonly",
            },
        },
        rules: {
            // Include TS ESLint recommended plugin rules
            ...tseslint.configs.recommended.rules,
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            semi: ["error", "always"],
            // Prettier rules
            "prettier/prettier": "error",
        },
    },
    // Playwright recommended rules for tests
    {
        ...playwright.configs["flat/recommended"],
        files: ["tests/**"],
        rules: {
            ...playwright.configs["flat/recommended"].rules,
        },
    },
];
