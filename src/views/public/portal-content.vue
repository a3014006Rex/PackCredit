<script setup>
import { AuthAPI } from "@/api/auth";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const errorMessage = ref("");
const content = ref(null);

const initContent = async (pcKey) => {
  loading.value = true;
  errorMessage.value = "";
  content.value = null;

  try {
    const res = await AuthAPI.GetPortalContent(pcKey);
    if (res.data.success && res.data.data) {
      const data = res.data.data;
      content.value = {
        ...data,
        title: data.title ?? data.PC_title ?? data.pC_title,
        isShowTitle:
          data.isShowTitle === true ||
          data.PC_IsShowTitle === true ||
          data.pC_IsShowTitle === true,
      };
    } else {
      errorMessage.value = res.data.message || "找不到指定內容";
    }
  } catch (error) {
    console.log("get portal content error", error);
    errorMessage.value = "內容載入失敗或已停止顯示";
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.params.pcKey,
  (pcKey) => initContent(pcKey),
  { immediate: true }
);
</script>

<template>
  <div class="portal-content-page">
    <main class="content-main" v-loading="loading">
      <el-result
        v-if="!loading && errorMessage"
        icon="warning"
        title="無法顯示內容"
        :sub-title="errorMessage"
      >
        <template #extra>
          <el-button type="primary" @click="router.push('/')">返回首頁</el-button>
        </template>
      </el-result>

      <article v-else-if="content" class="content-card">
        <header v-if="content.isShowTitle" class="content-header">
          <h1>{{ content.title }}</h1>
          <p v-if="content.summary">{{ content.summary }}</p>
        </header>
        <div class="content-body ql-editor" v-html="content.introduction"></div>
      </article>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.portal-content-page {
  min-height: 100vh;
  background: #f5f8fa;
}

.content-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 40px;
  background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%);
  border-bottom: 1px solid rgba(7, 93, 186, 0.12);
  box-shadow: 0 2px 10px rgba(7, 93, 186, 0.1);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: $primary;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.nav-logo {
  height: 52px;
  object-fit: contain;
}

.content-main {
  width: 75vw;
  min-height: 320px;
  margin: 40px auto 80px;
}

.content-card {
  padding: 40px 48px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(7, 93, 186, 0.1);
  overflow: hidden;
}

.content-header {
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--el-border-color-light);

  h1 {
    margin: 0 0 12px;
    color: var(--color-text-primary);
    font-size: 30px;
  }

  p {
    margin: 0;
    color: var(--color-text-secondary);
    line-height: 1.7;
  }
}

.content-body {
  width: 100%;
  height: auto;
  min-width: 0;
  padding: 0;
  overflow-y: visible;
  word-break: break-word;
  overflow-wrap: anywhere;

  :deep(*) {
    box-sizing: border-box;
    max-width: 100% !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(video),
  :deep(iframe) {
    max-width: 100%;
  }

  :deep(pre) {
    white-space: pre-wrap !important;
    overflow-x: auto;
  }

  :deep(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
}

@media (max-width: 640px) {
  .content-nav {
    padding: 0 18px;
  }

  .nav-brand span {
    display: none;
  }

  .content-card {
    padding: 28px 22px;
  }

  .content-main {
    width: calc(100vw - 24px);
    margin-top: 20px;
  }
}
</style>
