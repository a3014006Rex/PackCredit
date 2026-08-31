<script setup>
import { AuthAPI } from "@/api/auth";

const route = useRoute();
const router = useRouter();
const loading = ref(false);
const errorMessage = ref("");
const news = ref(null);

const formatPeriod = (beginDate, endDate) => {
  if (beginDate && endDate) return `${beginDate} ～ ${endDate}`;
  if (beginDate) return `${beginDate} 起`;
  if (endDate) return `即日起 ～ ${endDate}`;
  return "不限期間";
};

const formatFileSize = (fileSize) => {
  if (!Number.isFinite(Number(fileSize)) || Number(fileSize) <= 0) return "";
  const bytes = Number(fileSize);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getAttachmentUrl = (fileId) =>
  AuthAPI.GetNewsAttachmentUrl(news.value.newsId, fileId);

const initNewsDetail = async (newsId) => {
  loading.value = true;
  errorMessage.value = "";
  news.value = null;

  try {
    const res = await AuthAPI.GetNewsDetail(newsId);
    if (res.data.success && res.data.data) {
      news.value = res.data.data;
    } else {
      errorMessage.value = res.data.message || "找不到指定最新消息";
    }
  } catch (error) {
    console.log("get news detail error", error);
    errorMessage.value = "最新消息不存在、已下架或已超過公告期間";
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.params.newsId,
  (newsId) => initNewsDetail(newsId),
  { immediate: true }
);
</script>

<template>
  <div class="news-detail-page">
    <main class="detail-main" v-loading="loading">
      <el-result
        v-if="!loading && errorMessage"
        icon="warning"
        title="無法顯示最新消息"
        :sub-title="errorMessage"
      >
        <template #extra>
          <el-button @click="router.push('/')">返回首頁</el-button>
          <el-button type="primary" @click="router.push('/news')">查看其他消息</el-button>
        </template>
      </el-result>

      <article v-else-if="news" class="detail-card">
        <header class="detail-header">
          <div class="detail-meta">
            <el-tag v-if="news.isTop" type="danger" size="small" effect="light">置頂</el-tag>
            <span><i class="bx bx-calendar"></i>{{ news.publishDate }}</span>
            <span><i class="bx bx-show"></i>{{ news.viewCount }} 次瀏覽</span>
          </div>
          <h1>{{ news.title }}</h1>
          <div class="announcement-period">
            <i class="bx bx-time-five"></i>
            <span>公告期間：{{ formatPeriod(news.beginDate, news.endDate) }}</span>
          </div>
        </header>

        <figure v-if="news.coverImageData" class="detail-cover">
          <img :src="news.coverImageData" :alt="`${news.title}封面`" />
        </figure>

        <div class="detail-content" v-html="news.content"></div>

        <section v-if="news.attachments?.length" class="detail-attachments">
          <h2><i class="bx bx-paperclip"></i>附件下載</h2>
          <div class="attachment-list">
            <a
              v-for="file in news.attachments"
              :key="file.fileId"
              :href="getAttachmentUrl(file.fileId)"
              class="attachment-link"
            >
              <i class="bx bx-file"></i>
              <span class="attachment-info">
                <strong>{{ file.fileName }}</strong>
                <small v-if="formatFileSize(file.fileSize)">{{ formatFileSize(file.fileSize) }}</small>
              </span>
              <i class="bx bx-download"></i>
            </a>
          </div>
        </section>

        <footer class="detail-footer">
          <el-button @click="router.push('/news')">
            <i class="bx bx-left-arrow-alt"></i>
            返回最新消息
          </el-button>
        </footer>
      </article>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.news-detail-page {
  min-height: 100vh;
  background: #f5f8fa;
  color: var(--color-text-primary);
}

.news-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 0 40px;
  background: linear-gradient(135deg, #bff1e7 0%, #e4f4f8 58%, #f8e9e6 100%);
  border-bottom: 1px solid rgba(7, 93, 186, 0.12);
  box-shadow: 0 2px 10px rgba(7, 93, 186, 0.1);
}

.nav-brand,
.nav-actions {
  display: flex;
  align-items: center;
}

.nav-brand {
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

.nav-actions {
  gap: 8px;
}

.detail-main {
  width: 75vw;
  min-height: 360px;
  margin: 40px auto 80px;
}

.detail-card {
  padding: 40px 48px;
  overflow: hidden;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(7, 93, 186, 0.1);
}

.detail-header {
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--el-border-color-light);

  h1 {
    margin: 12px 0 0;
    font-size: 30px;
    line-height: 1.45;
  }
}

.announcement-period {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 14px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--color-text-secondary);
  font-size: 13px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

.detail-content {
  width: 100%;
  min-width: 0;
  min-height: 160px;
  font-size: 15px;
  line-height: 1.9;
  word-break: break-word;
  overflow-wrap: anywhere;

  :deep(*) {
    box-sizing: border-box;
    max-width: 100% !important;
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
    overflow-x: auto;
    white-space: pre-wrap !important;
  }

  :deep(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
}

.detail-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 760px;
  max-height: 420px;
  margin: 0 auto 32px;
  padding: 10px;
  overflow: hidden;
  background: #f5f7fa;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;

  img {
    display: block;
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
  }
}

.detail-attachments {
  padding-top: 24px;
  margin-top: 32px;
  border-top: 1px solid var(--el-border-color-lighter);

  h2 {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 0 0 14px;
    font-size: 18px;
  }
}

.attachment-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px 14px;
  color: var(--color-text-primary);
  text-decoration: none;
  background: #f8fafc;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  transition: border-color 0.2s ease, color 0.2s ease, background-color 0.2s ease;

  > i:first-child {
    flex-shrink: 0;
    color: $primary;
    font-size: 24px;
  }

  > i:last-child {
    flex-shrink: 0;
    margin-left: auto;
    font-size: 20px;
  }

  &:hover {
    color: $primary;
    background: rgba(7, 93, 186, 0.04);
    border-color: rgba(7, 93, 186, 0.35);
  }
}

.attachment-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;

  strong {
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    margin-top: 2px;
    color: var(--color-text-secondary);
    font-size: 11px;
  }
}

.detail-footer {
  display: flex;
  justify-content: center;
  padding-top: 28px;
  margin-top: 36px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 640px) {
  .news-nav {
    padding: 0 18px;
  }

  .nav-brand span {
    display: none;
  }

  .detail-main {
    width: calc(100vw - 24px);
    margin-top: 20px;
  }

  .detail-card {
    padding: 28px 22px;
  }

  .detail-header h1 {
    font-size: 24px;
  }

  .detail-cover {
    max-height: 300px;

    img {
      max-height: 280px;
    }
  }

  .detail-meta {
    flex-wrap: wrap;
  }
}
</style>
