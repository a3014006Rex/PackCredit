<script setup>
import MemberLayout from "@/components/layout/MemberLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { getCurrentInstance } from "vue";

const store = useAuthStore();
const { proxy } = getCurrentInstance();
const router = useRouter();

const idleLimit = 60 * 60 * 1000; // 60 分鐘
let idleTime = 0;
let idleTimer = null;

const resetIdle = () => { idleTime = 0; };

const startIdleTimer = () => {
  if (idleTimer || !store.user.token) return;

  idleTimer = setInterval(() => {
    idleTime += 1000;
    if (idleTime >= idleLimit) {
      store.cleanUser();
      proxy.$clearAuthCache?.();
      clearInterval(idleTimer);
      router.push("/login");
      ElMessageBox.alert("閒置超過 60 分鐘，系統已將您自動登出。", "系統提示", {
        confirmButtonText: "確認", type: "warning", center: true, showClose: false,
      });
    }
  }, 1000);
};

const stopIdleTimer = () => {
  if (!idleTimer) return;
  clearInterval(idleTimer);
  idleTimer = null;
  idleTime = 0;
};

watch(
  () => store.user.token,
  (token) => {
    if (token) {
      startIdleTimer();
    } else {
      stopIdleTimer();
    }
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener("click", resetIdle);
  document.addEventListener("keydown", resetIdle);
});

onUnmounted(() => {
  stopIdleTimer();
  document.removeEventListener("click", resetIdle);
  document.removeEventListener("keydown", resetIdle);
});
</script>

<template>
  <MemberLayout>
    <router-view />
  </MemberLayout>
</template>

<style lang="scss">
@import "@/assets/scss/main.scss";
</style>
