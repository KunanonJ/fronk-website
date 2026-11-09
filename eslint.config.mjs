import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".wrangler/**",
    ".sanity/**",
    ".claude/**",
    ".agents/**",
    ".codex/**",
    ".vibecode-backup/**",
    "out/**",
    "build/**",
    "dist/**",
    "public/studio/static/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),
  {
    rules: {
      // Personal site: prose includes apostrophes/quotes; the explicit-entity
      // requirement is noise without an a11y or escaping concern in modern React.
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // The TanStack Start app (tanstack-migration) is not Next: Next's document
    // and image rules don't apply, and the next/* shims drop Next-only props
    // by destructuring them into _-prefixed names.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-head-element": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
]);

export default eslintConfig;
