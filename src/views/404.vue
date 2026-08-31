<script setup>
const router = useRouter();
</script>

<template>
  <main class="not-found-page">
    <section class="not-found-content">
      <div class="error-code" aria-hidden="true"><span>4</span><i></i><span>4</span></div>
      <span class="eyebrow">PAGE NOT FOUND</span>
      <h1>找不到您要前往的頁面</h1>
      <p>網址可能已變更、輸入有誤，或該頁面目前暫時無法使用。</p>
      <div class="actions">
        <el-button size="large" @click="router.back()">返回上一頁</el-button>
        <el-button type="primary" size="large" @click="router.push('/')">回到首頁</el-button>
      </div>
    </section>
  </main>
</template>

<style lang="scss" scoped>
.not-found-page { min-height: 100vh; color: var(--color-text-primary); background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%); }
.not-found-nav { height: 64px; padding: 0 40px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(7, 93, 186, .12); background: rgba(255,255,255,.28); }
.nav-brand { display: flex; align-items: center; gap: 10px; color: $primary; font-size: 18px; font-weight: 700; cursor: pointer; }
.nav-brand img { height: 52px; object-fit: contain; }
.not-found-content { min-height: calc(100vh - 64px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 42px 20px 90px; text-align: center; }
.error-code { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; color: $primary; font-size: clamp(92px, 18vw, 172px); font-weight: 800; line-height: 1; letter-spacing: -10px; }
.error-code i { width: clamp(50px, 9vw, 86px); height: clamp(50px, 9vw, 86px); border: clamp(12px, 2vw, 18px) solid #16845B; border-radius: 50%; box-shadow: 0 0 0 12px rgba(255,255,255,.34), 0 10px 28px rgba(7,93,186,.15); }
.eyebrow { margin-top: 20px; color: $primary; font-size: 12px; font-weight: 700; letter-spacing: 1.6px; }
h1 { margin: 8px 0 12px; font-size: clamp(28px, 4vw, 42px); }
p { max-width: 460px; margin: 0; font-size: 16px; }
.actions { display: flex; gap: 12px; margin-top: 28px; }
@media (max-width: 640px) { .not-found-nav { padding: 10px 18px; } .nav-brand { font-size: 15px; } .nav-brand img { height: 42px; } .actions { width: 100%; flex-direction: column-reverse; } .actions .el-button { width: 100%; margin: 0; } }
</style>
