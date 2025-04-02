/*
 * @Author: wanglx
 * @Date: 2025-03-13 20:40:21
 * @LastEditors: wanglx
 * @LastEditTime: 2025-04-02 18:37:56
 * @Description: Vite 配置文件
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "/three-demo/", // GitHub Pages 的仓库名
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});
