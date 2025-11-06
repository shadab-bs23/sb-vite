import vue from "@vitejs/plugin-vue";
import path from "path";
import ElementPlus from "unplugin-element-plus/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import graphql from "@rollup/plugin-graphql";

/*
 * Reference
 * @link  https://vitejs.dev/config/
 */
export default defineConfig({
  logLevel: "info",
  plugins: [ElementPlus({}), vue(), graphql()],
  build: {
    chunkSizeWarningLimit: 3000,
    sourcemap: true,
    rollupOptions: {
      cache: false,
      output: {
        // Add [hash] to the file name
        entryFileNames: `[name].[hash].js`,
        chunkFileNames: `[name].[hash].js`,
        assetFileNames: `[name].[hash].[ext]`,
        manualChunks: {
          vendor: ["vue", "vue-router"], // Move common libraries into a separate chunk
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
