import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import graphql from "@rollup/plugin-graphql";

export default defineConfig({

  plugins: [vue(), graphql()],
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
