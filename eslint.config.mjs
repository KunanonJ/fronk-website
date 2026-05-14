import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
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
]);

export default eslintConfig;
