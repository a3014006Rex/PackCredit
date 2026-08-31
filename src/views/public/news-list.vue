<script setup>
import { AuthAPI } from "@/api/auth";

const router = useRouter();
const loading = ref(false);
const errorMessage = ref("");
const newsList = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
});

const initNewsList = async (page = 1) => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const res = await AuthAPI.GetNewsList(page, pagination.pageSize);
    if (!res.data.success) {
      errorMessage.value = res.data.message || "最新消息載入失敗";
      newsList.value = [];
      return;
    }

    newsList.value = Array.isArray(res.data.data) ? res.data.data : [];
    Object.assign(pagination, {
      currentPage: res.data.pagination?.currentPage ?? page,
      pageSize: res.data.pagination?.pageSize ?? pagination.pageSize,
      totalCount: res.data.pagination?.totalCount ?? newsList.value.length,
      totalPages: res.data.pagination?.totalPages ?? 1,
    });
  } catch (error) {
    console.log("get news list error", error);
    errorMessage.value = "最新消息載入失敗，請稍後再試";
    newsList.value = [];
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page) => {
  initNewsList(page);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => initNewsList());
</script>

<template>
  <div class="news-page">
    <main class="news-main">
      <header class="page-header">
        <p class="page-eyebrow">NEWS</p>
        <h1>最新消息</h1>
        <p>掌握平台最新動態與重要公告</p>
      </header>

      <section v-loading="loading" class="news-list-panel">
        <el-result
          v-if="!loading && errorMessage"
          icon="warning"
          title="無法載入最新消息"
          :sub-title="errorMessage"
        >
          <template #extra>
            <el-button type="primary" @click="initNewsList(pagination.currentPage)">重新載入</el-button>
          </template>
        </el-result>

        <el-empty
          v-else-if="!loading && !newsList.length"
          description="目前沒有最新消息"
        />

        <div v-else class="news-list">
          <router-link
            v-for="news in newsList"
            :key="news.newsId"
            :to="{ name: 'NewsDetail', params: { newsId: news.newsId } }"
            class="news-item"
          >
            <div class="news-item__date">
              <i class="bx bx-calendar"></i>
              <time>{{ news.publishDate }}</time>
            </div>
            <div class="news-item__content">
              <div class="news-item__title-row">
                <el-tag v-if="news.isTop" type="danger" size="small" effect="light">置頂</el-tag>
                <h2>{{ news.title }}</h2>
              </div>
              <p v-if="news.summary">{{ news.summary }}</p>
            </div>
            <i class="bx bx-chevron-right news-item__arrow"></i>
          </router-link>
        </div>

        <div v-if="!loading && pagination.totalCount > pagination.pageSize" class="pagination-bar">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="pagination.totalCount"
            :page-size="pagination.pageSize"
            :current-page="pagination.currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.news-page {
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

.news-main {
  width: 75vw;
  max-width: 1100px;
  margin: 40px auto 80px;
}

.page-header {
  margin-bottom: 24px;
  text-align: center;

  h1 {
    margin: 4px 0 10px;
    font-size: 32px;
  }

  > p:last-child {
    margin: 0;
    color: var(--color-text-secondary);
  }
}

.page-eyebrow {
  margin: 0;
  color: $primary;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
}

.news-list-panel {
  min-height: 360px;
  padding: 18px 28px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(7, 93, 186, 0.1);
}

.news-list {
  display: flex;
  flex-direction: column;
}

.news-item {
  display: grid;
  grid-template-columns: 135px minmax(0, 1fr) 24px;
  gap: 22px;
  align-items: center;
  padding: 22px 8px;
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: color 0.2s ease, background-color 0.2s ease;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    color: $primary;
    background: rgba(7, 93, 186, 0.035);

    .news-item__arrow {
      transform: translateX(4px);
    }
  }
}

.news-item__date {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--color-text-secondary);
  font-size: 13px;
}

.news-item__title-row {
  display: flex;
  align-items: center;
  gap: 9px;

  h2 {
    min-width: 0;
    margin: 0;
    font-size: 17px;
    line-height: 1.45;
  }
}

.news-item__content p {
  display: -webkit-box;
  margin: 7px 0 0;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.news-item__arrow {
  font-size: 24px;
  transition: transform 0.2s ease;
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 28px 0 10px;
}

@media (max-width: 768px) {
  .news-nav {
    padding: 0 18px;
  }

  .nav-brand span,
  .nav-actions .el-button:nth-child(2) {
    display: none;
  }

  .news-main {
    width: calc(100vw - 24px);
    margin-top: 24px;
  }

  .news-list-panel {
    padding: 10px 16px;
  }

  .news-item {
    grid-template-columns: 1fr 20px;
    gap: 10px;
  }

  .news-item__date {
    grid-column: 1 / -1;
  }
}
</style>
