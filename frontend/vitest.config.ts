import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      // `@/x` → `<root>/x` (mirrors the tsconfig path alias). Regex-scoped so it
      // never rewrites package imports like `@tabler/icons-react`.
      { find: /^@\/(.*)$/, replacement: `${root}/$1` },
      // `server-only` throws outside a React Server bundle; stub it for Node tests.
      { find: "server-only", replacement: path.join(root, "test/stubs/server-only.ts") },
    ],
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
