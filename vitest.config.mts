import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** .ts tests that use browser APIs (matchMedia, window, dataLayer). */
const DOM_TS_TESTS = [
  "lib/hooks/useReducedMotion.test.ts",
  "lib/hooks/useFinePointer.test.ts",
  "lib/analytics/gtag.test.ts",
  "lib/motion/motionRuntime.test.ts",
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    globals: false,
    // `.claude/` holds the agent harness and its git worktrees (full repo copies).
    exclude: ["node_modules", "dist/**", ".claude/**", "tests/e2e/**", "playwright.config.ts"],
    /*
     * Two projects (Phase 6, dev speed): building a jsdom window per file was
     * about two thirds of the run, so only component tests and the few .ts
     * tests that touch browser APIs get jsdom. Everything else runs in Node.
     */
    projects: [
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["**/*.test.tsx", ...DOM_TS_TESTS],
        },
      },
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["**/*.test.ts"],
          exclude: DOM_TS_TESTS,
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts", "components/**/*.tsx"],
      exclude: ["**/*.test.{ts,tsx}"],
    },
  },
});
