<script setup>
import { Login as rule_login } from "@/plugins/rules";
import { useAuthStore } from "@/stores/auth";

const store = useAuthStore();
const router = useRouter();
const formRef = ref();
const loading = ref(false);
const remember_me = ref(false);
const selected = ref(null);
const user = reactive({
  account: "admin@allpower.in",
  password: "!Allpower123",
});

const isProd = import.meta.env.PROD;

const beforeLogin = (formEl) => {
  formEl.validate((valid) => {
    if (valid) {
      login();
    } else {
      return;
    }
  });
};

const login = async () => {
  loading.value = true;

  try {
    await store.login(user);
  } catch (error) {
    console.log("catch", error);
  }
  loading.value = false;
};

onMounted(() => {});
</script>
<template>
  <div v-if="!isProd">
    <h1>開發人員登入</h1>
    <el-form
      ref="formRef"
      :model="user"
      :rules="rule_login"
      v-loading="loading"
      @submit.prevent="beforeLogin(formRef)"
    >
      <el-form-item prop="account">
        <el-input
          type="text"
          placeholder="請輸入帳號"
          v-model.trim="user.account"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          placeholder="請輸入密碼"
          v-model.trim="user.password"
          show-password
          @keyup.enter="beforeLogin(formRef)"
        ></el-input>
      </el-form-item>

      <el-form-item style="margin-bottom: 0">
        <el-button
          type="primary"
          @click="beforeLogin(formRef)"
          :loading="loading"
          :disable="loading"
          style="width: 100%"
          >登入</el-button
        >
      </el-form-item>
    </el-form>
  </div>
  <div v-else>
    <h1>請透過單一入口進行登入</h1>
  </div>
</template>

<style lang="scss" scoped>
.flex {
  display: flex;
  width: 100%;
  .el-input {
    flex: 1;
    margin-right: 8px;
  }
}
</style>
