import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 無 VITE_ 前綴的值只存在 Vite 開發伺服器，不會被打包進瀏覽器。
  const env = loadEnv(mode, process.cwd(), "");
  const apiKey = env.PACKCREDIT_API_KEY?.trim();
  const proxyHeaders = {
    "X-Client-Id": env.PACKCREDIT_CLIENT_ID || "packcredit-web-gateway",
    ...(apiKey ? { "X-Api-Key": apiKey } : {}),
  };

  return {
    server: {
      host: true,
      port: 8080,
      proxy: {
        "/api": {
          target: env.PACKCREDIT_API_UPSTREAM || "http://localhost:5237",
          changeOrigin: true,
          secure: false,
          headers: proxyHeaders,
        },
      },
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
  };
});
