<script setup>
import { ArrowRight } from "@element-plus/icons-vue";

const route = useRoute();
const breadcrumbs = computed(() => {
  const routes = route.matched;
  const items = [];
  routes.forEach((route) => {
    if (route.meta && route.meta.name) {
      const breadcrumb = {
        name: route.meta.name,
        to: route.path,
        isRoute: route.meta.isRoute,
      };
      items.push(breadcrumb);
    }
  });
  // items.shift(); // 不曉得為何都第一個都會重複出現
  return items;
});
</script>

<template>
  <div class="outside-view">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item
        :to="i.isRoute === false ? null : { path: i.to }"
        v-for="(i, idx) in breadcrumbs"
        :key="idx"
      >
        {{ i.name }}</el-breadcrumb-item
      >
    </el-breadcrumb>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.outside-view {
  min-height: calc(100% - 50px);
  padding: 15px 30px;
  overflow-x: hidden;
  overflow-y: auto;
  .el-breadcrumb {
    margin-bottom: 8px;
  }
}
</style>
