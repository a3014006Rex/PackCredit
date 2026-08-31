<script setup>
const router = useRouter();
const route = useRoute();
const eipid = route.query.eipid;
const loading = ref(false);

import { useAuthStore } from "@/stores/auth";

const store = useAuthStore();
const eipidLogin = async () => {
  loading.value = true;

  try {
    await store.eipidLogin(eipid);
  } catch (error) {
    console.log("catch", error);
  }
  loading.value = false;
};
onMounted(() => {
  // 1. admin 登入
  // 2. eipid取得 帳號資訊
  // 3. eipid取得 取得權限
  eipidLogin();
});
</script>

<template>
  <div class="auth">
    <el-card>
      <div class="logo" @click="router.push('/')">
        <img src="@/assets/images/logo.png" alt="" />
      </div>
      <p>正在重新導向...</p>
    </el-card>
  </div>
</template>

<style lang="scss">
@import "@/assets/scss/main.scss";
.el-card {
  p {
    text-align: center;
  }
  a {
    display: block;
    text-align: center;
  }
}
</style>
