<script setup>
const router = useRouter();
const formRef = ref();
const isVerified = ref(false);
const form = reactive({ email: "" });
const rules = {
  email: [
    { required: true, message: "請輸入註冊時使用的電子信箱", trigger: "blur" },
    { type: "email", message: "請輸入正確的 Email 格式", trigger: "blur" },
  ],
};

const verifyAccount = async () => {
  try {
    await formRef.value.validate();
    isVerified.value = true;
  } catch {
    ElMessage.warning("請輸入正確的電子信箱");
  }
};
</script>

<template>
  <div class="forgot-page">
    <main class="forgot-main">
      <section class="forgot-card">
        <template v-if="!isVerified">
          <div class="icon-panel"><i class="bx bx-key"></i></div>
          <span class="eyebrow">ACCOUNT ASSISTANCE</span>
          <h1>忘記密碼了嗎？</h1>
          <p class="intro">請輸入註冊時使用的電子信箱，我們會協助您確認帳號並安排密碼重設流程。</p>

          <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="verifyAccount">
            <el-form-item label="電子信箱" prop="email">
              <el-input v-model.trim="form.email" size="large" placeholder="name@company.com" @keyup.enter="verifyAccount">
                <template #prefix><i class="bx bx-envelope"></i></template>
              </el-input>
            </el-form-item>
            <el-button type="primary" size="large" class="full-button" @click="verifyAccount">確認帳號資訊</el-button>
          </el-form>

          <div class="help-tip"><i class="bx bx-info-circle"></i><span>無法確認帳號時，請聯繫客服並提供公司名稱與聯絡電話。</span></div>
        </template>

        <template v-else>
          <div class="icon-panel is-success"><i class="bx bx-check"></i></div>
          <span class="eyebrow">NEXT STEP</span>
          <h1>請聯繫客服完成重設</h1>
          <p class="intro">您的帳號資訊已完成前端檢核。客服核對會員資料後，將協助您完成密碼重設。</p>
          <div class="verified-email"><i class="bx bx-envelope"></i>{{ form.email }}</div>
          <div class="action-stack">
            <el-button @click="isVerified = false">修改電子信箱</el-button>
            <el-button type="primary" @click="router.push('/login')">返回會員登入</el-button>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.forgot-page { min-height: 100vh; background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%); color: var(--color-text-primary); }
.forgot-nav { height: 64px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(7,93,186,.12); background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%); box-shadow: 0 2px 10px rgba(7,93,186,.10); }
.nav-brand { display: flex; align-items: center; gap: 10px; color: $primary; font-size: 18px; font-weight: 700; cursor: pointer; }
.nav-logo { height: 52px; object-fit: contain; }
.forgot-nav i { margin-right: 4px; }
.forgot-main { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; padding: 44px 20px; }
.forgot-card { width: 100%; max-width: 470px; padding: 42px 40px; border: 1px solid rgba(255,255,255,.92); border-radius: 22px; background: rgba(255,255,255,.94); box-shadow: 0 18px 42px rgba(7,93,186,.16); text-align: center; }
.icon-panel { display: flex; align-items: center; justify-content: center; width: 66px; height: 66px; margin: 0 auto 18px; border-radius: 18px; background: #E8F6F5; color: $primary; font-size: 32px; }
.icon-panel.is-success { border-radius: 50%; background: #16845B; color: #fff; }
.eyebrow { color: $primary; font-size: 12px; font-weight: 700; letter-spacing: 1.5px; }
h1 { margin: 8px 0 12px; font-size: 28px; }
.intro { margin: 0 0 28px; color: var(--color-text-secondary); line-height: 1.75; }
:deep(.el-form-item__label) { color: var(--color-text-primary); font-weight: 600; }
.full-button { width: 100%; }
.help-tip { display: flex; gap: 8px; margin-top: 24px; padding: 13px 14px; border-radius: 10px; background: #F1F8F8; color: var(--color-text-secondary); font-size: 12px; line-height: 1.55; text-align: left; }
.help-tip i { flex: 0 0 auto; margin-top: 2px; color: $primary; font-size: 16px; }
.verified-email { display: flex; justify-content: center; align-items: center; gap: 7px; margin: -8px 0 26px; padding: 12px; border: 1px solid var(--color-border); border-radius: 10px; background: #F5FBFB; color: $primary; font-weight: 600; }
.action-stack { display: flex; justify-content: center; gap: 12px; }
@media (max-width: 640px) { .forgot-nav { padding: 10px 18px; } .nav-brand { font-size: 15px; } .nav-logo { height: 42px; } .forgot-card { padding: 34px 24px; } .action-stack { flex-direction: column-reverse; } .action-stack .el-button { width: 100%; margin: 0; } }
</style>
