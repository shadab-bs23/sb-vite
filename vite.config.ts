import { defineConfig, Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import graphql from "@rollup/plugin-graphql";

// Plugin to fix Element Plus malformed import paths
function fixElementPlusImports(): Plugin {
  const fixPatterns: Array<[RegExp, string]> = [
    [/use-\{\}-config\.mjs/g, "use-global-config.mjs"],
    [/use-prevent-\{\}\/index\.mjs/g, "use-prevent-global/index.mjs"],
    [/use-prevent-\{\}/g, "use-prevent-global"],
    [/\{\}-node\.mjs/g, "is-node.mjs"],
  ];

  return {
    name: "fix-element-plus-imports",
    enforce: "pre",
    resolveId(id, importer) {
      // Only fix malformed import paths in Element Plus files
      if (id.includes("{}") && importer && importer.includes("element-plus")) {
        let fixedId = id;
        for (const [pattern, replacement] of fixPatterns) {
          fixedId = fixedId.replace(pattern, replacement);
        }

        if (fixedId !== id) {
          // Resolve relative to the importer
          const importerDir = path.dirname(importer);
          const resolved = path.resolve(importerDir, fixedId);
          if (resolved.includes("element-plus")) {
            return resolved;
          }
        }
      }
      return null;
    },
  };
}

export default defineConfig({
  logLevel: "info",
  plugins: [fixElementPlusImports(), vue(), graphql()],
  define: {
    global: {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      find: "./runtimeConfig",
      replacement: "./runtimeConfig.browser",
    },
  },
});
