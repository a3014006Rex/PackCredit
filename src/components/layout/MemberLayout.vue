<script setup></script>

<template>
  <div class="member-layout">
    <main class="member-main">
      <slot />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.member-layout {
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.member-main {
  flex: 1;
  overflow: auto;
}
</style>
