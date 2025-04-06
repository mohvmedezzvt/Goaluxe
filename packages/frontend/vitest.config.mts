// vite.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.tsx"], // Make sure this path is correct
    globals: true,
    // Add these for Next.js compatibility
    server: {
      deps: {
        inline: ["next"],
      },
    },
  },
});
