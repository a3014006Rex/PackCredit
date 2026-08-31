import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/dist/locale/zh-tw.mjs";
import "quill/dist/quill.core.css";
import price from './plugins/price'
import auth from './plugins/auth'
const app = createApp(App);
app.use(auth)
app.use(price)
app.use(createPinia());
app.use(router);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(ElementPlus, {
  locale: zhCn,
});
app.mount("#app");
