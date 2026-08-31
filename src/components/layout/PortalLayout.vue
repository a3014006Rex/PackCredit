<script setup>
import PortalNavigation from "./PortalNavigation.vue";
</script>

<template>
  <div class="portal-layout">
    <PortalNavigation />
    <div class="portal-layout__content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.portal-layout {
  min-height: 100vh;
}

.portal-layout__content {
  min-height: calc(100vh - 64px);
}
</style>
