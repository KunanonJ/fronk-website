import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// With `globals: false`, @testing-library/react's automatic afterEach cleanup is
// not registered, so rendered DOM leaks between tests in a file. Wire it
// explicitly so each test starts from a clean document (FIRST: Independent).
afterEach(() => {
  cleanup();
});
