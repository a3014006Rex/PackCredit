import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 8080,
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router"],
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
      extensions: ["vue"],
      dirs: ["src/components"],
      include: [/\.vue$/, /\.vue\?vue/],
      deep: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        additionalData: `
          @use "@/assets/scss/element/index.scss" as element;
          @use "@/assets/scss/_variables.scss" as *;
        `,
      },
    },
  },
});
