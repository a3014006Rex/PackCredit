<script setup>
const router = useRouter();
</script>

<template>
  <div class="auth">
    <el-card>
      <div class="logo" @click="router.push('/auth')">
        <img src="@/assets/images/logo.png" alt="" />
      </div>

      <router-view></router-view>
    </el-card>
  </div>
</template>

<style lang="scss">
@import "@/assets/scss/main.scss";
</style>
