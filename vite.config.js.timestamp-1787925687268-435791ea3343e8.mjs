// vite.config.js
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///D:/%E6%AC%A3%E5%AE%87%E7%B7%A9%E8%A1%9D%E5%8C%85%E8%A3%9D%E5%84%B2%E5%80%BC%E7%B3%BB%E7%B5%B1_%E5%A0%B1%E5%83%B9%E4%B8%AD/PackCredit/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/%E6%AC%A3%E5%AE%87%E7%B7%A9%E8%A1%9D%E5%8C%85%E8%A3%9D%E5%84%B2%E5%80%BC%E7%B3%BB%E7%B5%B1_%E5%A0%B1%E5%83%B9%E4%B8%AD/PackCredit/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///D:/%E6%AC%A3%E5%AE%87%E7%B7%A9%E8%A1%9D%E5%8C%85%E8%A3%9D%E5%84%B2%E5%80%BC%E7%B3%BB%E7%B5%B1_%E5%A0%B1%E5%83%B9%E4%B8%AD/PackCredit/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/%E6%AC%A3%E5%AE%87%E7%B7%A9%E8%A1%9D%E5%8C%85%E8%A3%9D%E5%84%B2%E5%80%BC%E7%B3%BB%E7%B5%B1_%E5%A0%B1%E5%83%B9%E4%B8%AD/PackCredit/node_modules/unplugin-vue-components/dist/vite.js";
import { ElementPlusResolver } from "file:///D:/%E6%AC%A3%E5%AE%87%E7%B7%A9%E8%A1%9D%E5%8C%85%E8%A3%9D%E5%84%B2%E5%80%BC%E7%B3%BB%E7%B5%B1_%E5%A0%B1%E5%83%B9%E4%B8%AD/PackCredit/node_modules/unplugin-vue-components/dist/resolvers.js";
var __vite_injected_original_import_meta_url = "file:///D:/%E6%AC%A3%E5%AE%87%E7%B7%A9%E8%A1%9D%E5%8C%85%E8%A3%9D%E5%84%B2%E5%80%BC%E7%B3%BB%E7%B5%B1_%E5%A0%B1%E5%83%B9%E4%B8%AD/PackCredit/vite.config.js";
var vite_config_default = defineConfig({
  server: {
    host: true,
    port: 8080
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router"],
      resolvers: [ElementPlusResolver({ importStyle: "sass" })]
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
      extensions: ["vue"],
      dirs: ["src/components"],
      include: [/\.vue$/, /\.vue\?vue/],
      deep: true
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        additionalData: `
          @use "@/assets/scss/element/index.scss" as element;
          @use "@/assets/scss/_variables.scss" as *;
        `
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxcdTZCMjNcdTVCODdcdTdERTlcdTg4NURcdTUzMDVcdTg4RERcdTUxMzJcdTUwM0NcdTdDRkJcdTdENzFfXHU1ODMxXHU1MEY5XHU0RTJEXFxcXFBhY2tDcmVkaXRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFx1NkIyM1x1NUI4N1x1N0RFOVx1ODg1RFx1NTMwNVx1ODhERFx1NTEzMlx1NTAzQ1x1N0NGQlx1N0Q3MV9cdTU4MzFcdTUwRjlcdTRFMkRcXFxcUGFja0NyZWRpdFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovJUU2JUFDJUEzJUU1JUFFJTg3JUU3JUI3JUE5JUU4JUExJTlEJUU1JThDJTg1JUU4JUEzJTlEJUU1JTg0JUIyJUU1JTgwJUJDJUU3JUIzJUJCJUU3JUI1JUIxXyVFNSVBMCVCMSVFNSU4MyVCOSVFNCVCOCVBRC9QYWNrQ3JlZGl0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSBcIm5vZGU6dXJsXCI7XHJcblxyXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgdnVlIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWVcIjtcclxuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSBcInVucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGVcIjtcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSBcInVucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGVcIjtcclxuaW1wb3J0IHsgRWxlbWVudFBsdXNSZXNvbHZlciB9IGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnNcIjtcclxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiB0cnVlLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFtcInZ1ZVwiLCBcInZ1ZS1yb3V0ZXJcIl0sXHJcbiAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoeyBpbXBvcnRTdHlsZTogXCJzYXNzXCIgfSldLFxyXG4gICAgfSksXHJcbiAgICBDb21wb25lbnRzKHtcclxuICAgICAgcmVzb2x2ZXJzOiBbRWxlbWVudFBsdXNSZXNvbHZlcih7IGltcG9ydFN0eWxlOiBcInNhc3NcIiB9KV0sXHJcbiAgICAgIGV4dGVuc2lvbnM6IFtcInZ1ZVwiXSxcclxuICAgICAgZGlyczogW1wic3JjL2NvbXBvbmVudHNcIl0sXHJcbiAgICAgIGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvXSxcclxuICAgICAgZGVlcDogdHJ1ZSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vc3JjXCIsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGNzczoge1xyXG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICBzY3NzOiB7XHJcbiAgICAgICAgYXBpOiBcIm1vZGVybi1jb21waWxlclwiLFxyXG4gICAgICAgIGFkZGl0aW9uYWxEYXRhOiBgXHJcbiAgICAgICAgICBAdXNlIFwiQC9hc3NldHMvc2Nzcy9lbGVtZW50L2luZGV4LnNjc3NcIiBhcyBlbGVtZW50O1xyXG4gICAgICAgICAgQHVzZSBcIkAvYXNzZXRzL3Njc3MvX3ZhcmlhYmxlcy5zY3NzXCIgYXMgKjtcclxuICAgICAgICBgLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvWCxTQUFTLGVBQWUsV0FBVztBQUV2WixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUywyQkFBMkI7QUFOaUksSUFBTSwyQ0FBMkM7QUFRdE4sSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFdBQVc7QUFBQSxNQUNULFNBQVMsQ0FBQyxPQUFPLFlBQVk7QUFBQSxNQUM3QixXQUFXLENBQUMsb0JBQW9CLEVBQUUsYUFBYSxPQUFPLENBQUMsQ0FBQztBQUFBLElBQzFELENBQUM7QUFBQSxJQUNELFdBQVc7QUFBQSxNQUNULFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxhQUFhLE9BQU8sQ0FBQyxDQUFDO0FBQUEsTUFDeEQsWUFBWSxDQUFDLEtBQUs7QUFBQSxNQUNsQixNQUFNLENBQUMsZ0JBQWdCO0FBQUEsTUFDdkIsU0FBUyxDQUFDLFVBQVUsWUFBWTtBQUFBLE1BQ2hDLE1BQU07QUFBQSxJQUNSLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gscUJBQXFCO0FBQUEsTUFDbkIsTUFBTTtBQUFBLFFBQ0osS0FBSztBQUFBLFFBQ0wsZ0JBQWdCO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
