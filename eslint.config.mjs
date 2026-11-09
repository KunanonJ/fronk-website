import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/*
 * Lint for the TanStack Start app: React + React Hooks recommended, a jsx-a11y
 * subset and typescript-eslint recommended (the set eslint-config-next used to
 * provide), with the plugins as direct dependencies so upgrades are explicit.
 */
export default defineConfig([
  globalIgnores([
    "dist/**",
    ".wrangler/**",
    ".sanity/**",
    ".claude/**",
    ".agents/**",
    ".codex/**",
    ".vibecode-backup/**",
    "public/studio/static/**",
    "src/routeTree.gen.ts",
    "node_modules/**",
    // Build output of the old Next.js setup, still present in older clones.
    ".next/**",
    ".open-next/**",
  ]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts}"],
    plugins: { react, "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unknown-property": "off",
      "react/jsx-no-target-blank": "off",
      // Personal site: prose includes apostrophes and quotes; escaping them adds noise.
      "react/no-unescaped-entities": "off",
      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      // `_`-prefixed names are deliberate (dropped props, unused args).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
]);
