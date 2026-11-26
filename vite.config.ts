import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Set BASE_PATH=/portfolio/ when building for GitHub Pages.
  base: process.env.BASE_PATH || "/",
  plugins: [
    react(),
    tailwindcss(),
    // `import Foo from "./foo.svg?react"` gives a React component.
    svgr(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
  },
});
