<script setup>
import { useAuthStore } from "@/stores/auth";
import { AuthAPI } from "@/api/auth";
import { Login as rules } from "@/plugins/rules";

const store = useAuthStore();
const router = useRouter();

const formRef = ref(null);
const loading = ref(false);
const captchaValue = ref("");
const captchaId = ref("");
const captchaImg = ref("");

const user = reactive({
  account: "",
  password: "",
});

/* ===== 從後台取驗證碼圖片 ===== */
const refreshCaptcha = async () => {
  try {
    const res = await AuthAPI.GetCaptcha();
    captchaId.value = res.data.captchaId;
    captchaImg.value = res.data.imageBase64;
  } catch {
    // 後台不可用時 fallback 純前端驗證碼
    captchaId.value = "";
    captchaImg.value = "";
  }
  captchaValue.value = "";
};

const handleLogin = async () => {
  try {
    await formRef.value.validate();
  } catch {
    return;
  }
  if (!captchaValue.value.trim()) {
    ElMessage.error("請輸入驗證碼");
    return;
  }
  loading.value = true;
  try {
    await store.memberLogin({
      account: user.account,
      password: user.password,
      captchaId: captchaId.value,
      captchaCode: captchaValue.value,
    });
  } catch {
    // ignore
  }
  await refreshCaptcha();
  loading.value = false;
};

onMounted(() => {
  refreshCaptcha();
});
</script>

<template>
  <div class="login-page">
    <!-- 登入卡片 -->
    <div class="login-container">
      <el-card class="login-card" shadow="always">
        <div class="login-header">
          <div class="login-icon">
            <i class="bx bxs-lock-alt"></i>
          </div>
          <h2 class="login-title">會員登入</h2>
          <p class="login-subtitle">歡迎回來，請登入您的帳號</p>
        </div>

        <el-form
          ref="formRef"
          :model="user"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleLogin"
        >
          <!-- 帳號 -->
          <el-form-item label="帳號 / Email" prop="account">
            <el-input
              v-model.trim="user.account"
              placeholder="請輸入帳號或電子信箱"
              size="large"
            >
              <template #prefix>
                <i class="bx bx-user" style="font-size: 16px"></i>
              </template>
            </el-input>
          </el-form-item>

          <!-- 密碼 -->
          <el-form-item label="密碼" prop="password">
            <el-input
              v-model.trim="user.password"
              type="password"
              placeholder="請輸入密碼"
              size="large"
              show-password
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <i class="bx bx-lock-alt" style="font-size: 16px"></i>
              </template>
            </el-input>
          </el-form-item>

          <!-- 驗證碼 -->
          <el-form-item label="驗證碼">
            <div class="captcha-row">
              <el-input
                v-model="captchaValue"
                placeholder="請輸入右側驗證碼"
                size="large"
                style="flex: 1"
                maxlength="6"
                @keyup.enter="handleLogin"
              />
              <div class="captcha-box" @click="refreshCaptcha" title="點擊刷新驗證碼">
                <img
                  v-if="captchaImg"
                  :src="'data:image/png;base64,' + captchaImg"
                  alt="驗證碼"
                  class="captcha-img"
                />
                <span v-else class="captcha-loading">載入中...</span>
                <i class="bx bx-refresh captcha-refresh"></i>
              </div>
            </div>
            <div class="captcha-hint">不區分大小寫，點擊驗證碼可刷新</div>
          </el-form-item>

          <!-- 登入按鈕 -->
          <el-form-item style="margin-top: 8px">
            <el-button
              type="primary"
              size="large"
              style="width: 100%"
              :loading="loading"
              @click="handleLogin"
            >
              登 入
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 輔助連結 -->
        <div class="login-links">
          <el-button link type="primary" @click="router.push('/forgot-password')">
            忘記密碼？
          </el-button>
          <el-divider direction="vertical" />
          <el-button link type="primary" @click="router.push('/register')">
            註冊帳號
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%);
  display: flex;
  flex-direction: column;
}

/* ===== Navbar ===== */
.login-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 60px;
  background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(7, 93, 186, 0.12);

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .nav-logo {
      height: 48px;
      object-fit: contain;
    }

    .brand-name {
      font-size: 16px;
      font-weight: 700;
      color: $primary;
    }
  }
}

/* ===== 登入容器 ===== */
.login-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  border-radius: 16px;
  padding: 12px 8px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .login-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba($primary, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;

    i {
      font-size: 28px;
      color: $primary;
    }
  }

  .login-title {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 8px;
  }

  .login-subtitle {
    font-size: 14px;
    color: #888;
    margin: 0;
  }
}

/* ===== 驗證碼 ===== */
.captcha-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-box {
  position: relative;
  min-width: 120px;
  height: 40px;
  background: linear-gradient(135deg, #f5f5f5, #eee);
  border: 1px solid #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  cursor: pointer;
  user-select: none;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 4px;
  padding: 0 10px;
  transition: background 0.15s;

  &:hover {
    background: linear-gradient(135deg, #ece9e6, #e4e1de);
  }

  .captcha-img {
    height: 36px;
    display: block;
    border-radius: 3px;
  }

  .captcha-loading {
    font-size: 12px;
    color: #bbb;
  }

  .captcha-refresh {
    position: absolute;
    bottom: -2px;
    right: 3px;
    font-size: 11px;
    color: #bbb;
  }
}

.captcha-hint {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
}

/* ===== 輔助連結 ===== */
.login-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
