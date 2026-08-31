<script setup>
import { ArrowRight, ArrowLeft } from "@element-plus/icons-vue";
const emits = defineEmits(["back", "click1", "click2", "click3"]);
const props = defineProps({
  click1: {
    type: String,
  },
  click2: {
    type: String,
  },
  click3: {
    type: String,
  },
  click4: {
    type: String,
  },
  disabled: Boolean,
  loading: Boolean,
});
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
  return items;
});
</script>

<template>
  <div class="inside-view">
    <div class="inside-header">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item
          :to="i.isRoute === false ? null : { path: i.to }"
          v-for="(i, idx) in breadcrumbs"
          :key="idx"
        >
          {{ i.name }}</el-breadcrumb-item
        >
      </el-breadcrumb>
      <el-page-header :icon="ArrowLeft" @back="emits('back')">
        <template #content>
          <div class="title">
            <slot name="title"></slot>
          </div>
        </template>

        <template #extra>
          <el-button
            size="small"
            v-if="click1"
            @click="emits('click1')"
            :disabled="disabled || loading"
            >{{ loading ? "請稍後..." : click1 }}
          </el-button>
          <el-button
            size="small"
            type="primary"
            v-if="click2"
            @click="emits('click2')"
            :disabled="disabled || loading"
            >{{ loading ? "請稍後..." : click2 }}</el-button
          >
          <el-button
            size="small"
            type="danger"
            v-if="click3"
            @click="emits('click3')"
            :disabled="disabled || loading"
            >{{ loading ? "請稍後..." : click3 }}</el-button
          >
          <el-button
            size="small"
            type="danger"
            v-if="click4"
            @click="emits('click4')"
            :disabled="disabled || loading"
            >{{ loading ? "請稍後..." : click4 }}</el-button
          >
        </template>
      </el-page-header>
    </div>
    <div class="inside-body">
      <div class="content">
        <slot name="main"></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.inside-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  .inside-header {
    background-color: white;
    padding: 0px 30px;
    height: 75px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    // position: sticky;
    // top: 0px;
    // z-index: 1;
    // box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.1);
  }
  .el-breadcrumb {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .title {
    font-weight: bold;
  }
  .inside-body {
    padding: 15px;
    height: calc(100vh - 130px);
    .content {
      height: 100%;
      border-radius: 4px;
      padding: 25px 30px;
      background-color: white;
      overflow-y: auto;
      @include scrollbar;
    }
  }
}
</style>
