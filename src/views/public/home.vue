<script setup>
import { AuthAPI } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const isLoggedIn = computed(() => Boolean(authStore.user.token));

const heroBanners = ref([]);
const heroLoading = ref(true);
const newsList = ref([]);
const newsLoading = ref(true);
const newsError = ref("");
const productList = ref([]);
const productLoading = ref(true);
const productError = ref("");
const aboutContent = ref(null);
const aboutLoading = ref(true);

const initHeroBanners = async () => {
  try {
    const res = await AuthAPI.GetHeroBanners();
    if (res.data.success && res.data.data?.length) {
      heroBanners.value = res.data.data;
    }
  } catch {
    // 後台不可用時使用靜態 fallback
  } finally {
    heroLoading.value = false;
  }
};

const initLatestNews = async () => {
  newsLoading.value = true;
  newsError.value = "";

  try {
    const res = await AuthAPI.GetLatestNews();
    newsList.value = res.data.success && Array.isArray(res.data.data)
      ? res.data.data
      : [];
  } catch (error) {
    console.log("get latest news error", error);
    newsList.value = [];
    newsError.value = "最新消息載入失敗，請稍後再試";
  } finally {
    newsLoading.value = false;
  }
};

const initLatestProducts = async () => {
  productLoading.value = true;
  productError.value = "";

  try {
    const res = await AuthAPI.GetLatestProducts();
    productList.value = res.data.success && Array.isArray(res.data.data)
      ? res.data.data
      : [];
  } catch (error) {
    console.log("get latest products error", error);
    productList.value = [];
    productError.value = "商品載入失敗，請稍後再試";
  } finally {
    productLoading.value = false;
  }
};

const initAboutUs = async () => {
  aboutLoading.value = true;

  try {
    const res = await AuthAPI.GetAboutUs();
    if (res.data.success && res.data.data) {
      const data = res.data.data;
      aboutContent.value = {
        ...data,
        isShowTitle:
          data.isShowTitle === true ||
          data.PC_IsShowTitle === true ||
          data.pC_IsShowTitle === true,
      };
    } else {
      aboutContent.value = null;
    }
  } catch (error) {
    console.log("get about us error", error);
    aboutContent.value = null;
  } finally {
    aboutLoading.value = false;
  }
};

const openNews = (newsId) => {
  router.push({ name: "NewsDetail", params: { newsId } });
};

const formatProductPrice = (product) => {
  if (product.price == null) return "價格請洽詢";
  const minimum = Number(product.price).toLocaleString("zh-TW");
  if (product.maximumPrice != null && product.maximumPrice !== product.price) {
    const maximum = Number(product.maximumPrice).toLocaleString("zh-TW");
    return `NT$ ${minimum} ～ ${maximum}`;
  }
  return `NT$ ${minimum}`;
};

onMounted(() => {
  initHeroBanners();
  initLatestNews();
  initLatestProducts();
  initAboutUs();
});

const stats = ref([
  { value: "1,200+", label: "企業客戶" },
  { value: "50,000+", label: "商品項目" },
  { value: "98%", label: "客戶滿意度" },
  { value: "24/7", label: "客服支援" },
]);
</script>

<template>
  <div class="public-home">
    <!-- Hero 區塊 -->
    <section class="hero">
      <!-- API Banner 輪播（有資料時顯示） -->
      <template v-if="!heroLoading && heroBanners.length">
        <el-carousel height="420px" :interval="5000" arrow="always" class="hero-carousel">
          <el-carousel-item v-for="banner in heroBanners" :key="banner.fileID">
            <div
              class="hero-banner-item"
              :class="{ 'no-image': !banner.imageData }"
              :style="banner.imageData ? `background-image:url(${banner.imageData})` : ''"
            >
              <div class="hero-banner-overlay" v-if="banner.title || banner.subtitle">
                <h2 class="hero-banner-title" v-if="banner.title">{{ banner.title }}</h2>
                <p class="hero-banner-subtitle" v-if="banner.subtitle">{{ banner.subtitle }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </template>

      <!-- 靜態 fallback（無 API banner 時顯示） -->
      <template v-else-if="!heroLoading">
        <div class="hero-content">
          <div class="hero-badge">企業採購首選平台</div>
          <h1 class="hero-title">讓採購更簡單<br />更有效率</h1>
          <p class="hero-desc">
            提供完整的 B2B 企業採購解決方案，從商品瀏覽、訂單管理到帳務處理，
            一站式滿足您的企業採購需求。
          </p>
          <div class="hero-actions">
            <el-button type="primary" size="large" round @click="router.push('/login')">立即登入</el-button>
            <el-button size="large" round plain @click="router.push('/register')">申請帳號</el-button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card-stack">
            <div class="hero-stat" v-for="stat in stats" :key="stat.label">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </template>
    </section>

    <!-- 最新消息 -->
    <section class="section news-section">
      <div class="section-container">
        <div class="section-header section-header--with-action">
          <h2 class="section-title">最新消息</h2>
          <p class="section-desc">掌握平台最新動態與優惠資訊</p>
          <el-button class="news-more" link type="primary" @click="router.push('/news')">
            查看全部
            <i class="bx bx-right-arrow-alt"></i>
          </el-button>
        </div>
        <div v-loading="newsLoading" class="news-grid">
          <article
            v-for="news in newsList"
            :key="news.newsId"
            class="news-card"
            role="link"
            tabindex="0"
            @click="openNews(news.newsId)"
            @keydown.enter="openNews(news.newsId)"
          >
            <div class="news-card__meta">
              <el-tag size="small" :type="news.isTop ? 'danger' : 'info'" effect="light">
                {{ news.isTop ? "置頂" : "公告" }}
              </el-tag>
              <time class="news-card__date">{{ news.publishDate }}</time>
            </div>
            <h3 class="news-card__title">{{ news.title }}</h3>
            <div v-if="news.coverImageData" class="news-card__cover">
              <img :src="news.coverImageData" :alt="`${news.title}封面`" />
            </div>
            <p class="news-card__summary">{{ news.summary }}</p>
          </article>
          <el-empty
            v-if="!newsLoading && !newsError && !newsList.length"
            class="news-empty"
            description="目前沒有最新消息"
          />
        </div>
        <div v-if="!newsLoading && newsError" class="news-error">
          <span>{{ newsError }}</span>
          <el-button link type="primary" @click="initLatestNews">重新載入</el-button>
        </div>
      </div>
    </section>

    <!-- 產品介紹 -->
    <section class="section products-section">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">產品介紹</h2>
          <p class="section-desc">多元商品分類，滿足各類企業採購需求</p>
        </div>
        <div v-loading="productLoading" class="products-grid">
          <article
            class="product-card"
            v-for="product in productList"
            :key="product.productId"
            @click="router.push('/app')"
          >
            <div class="product-card__image">
              <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" />
              <i v-else class="bx bx-image-alt"></i>
            </div>
            <div class="product-card__body">
              <span class="product-card__category">{{ product.categoryName }}</span>
              <h3 class="product-card__name">{{ product.name }}</h3>
              <p v-if="product.specification" class="product-card__desc">{{ product.specification }}</p>
              <strong class="product-card__price">{{ formatProductPrice(product) }}</strong>
            </div>
          </article>
          <el-empty
            v-if="!productLoading && !productList.length && !productError"
            class="products-empty"
            description="目前沒有上架商品"
          />
        </div>
        <div v-if="!productLoading && productError" class="products-error">
          <span>{{ productError }}</span>
          <el-button link type="primary" @click="initLatestProducts">重新載入</el-button>
        </div>
        <div v-if="!productLoading && productList.length" class="products-more">
          <el-button type="primary" plain round @click="router.push('/app')">查看全部商品</el-button>
        </div>
      </div>
    </section>

    <!-- 基本內容說明 -->
    <section v-if="aboutLoading || aboutContent" class="section about-section">
      <div class="section-container">
        <div class="about-layout">
          <div v-loading="aboutLoading" class="about-layout__content">
            <template v-if="aboutContent">
              <h2 v-if="aboutContent.isShowTitle" class="about-title">{{ aboutContent.title }}</h2>
              <p v-if="aboutContent.summary" class="about-summary">{{ aboutContent.summary }}</p>
              <div class="about-rich-content ql-editor" v-html="aboutContent.introduction"></div>
            </template>
          </div>
          <div class="about-layout__stats">
            <div class="stats-grid">
              <div class="stat-block" v-for="stat in stats" :key="stat.label">
                <strong class="stat-block__value">{{ stat.value }}</strong>
                <span class="stat-block__label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 頁尾 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-brand">
            <img src="@/assets/images/logo.png" alt="logo" class="footer-logo" />
            <span>通路點數平台</span>
          </div>
          <p class="footer-copy">© 2025 通路點數平台. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.public-home {
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: var(--font-family-base);
  color: var(--color-text-primary);
}

/* ===== Navbar ===== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
  background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(7, 93, 186, 0.12);
  box-shadow: 0 2px 10px rgba(7, 93, 186, 0.10);

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .nav-logo {
      height: 54px;
      object-fit: contain;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 700;
      color: $primary;
    }
  }

  .nav-menu {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    margin-left: auto;
    margin-right: 28px;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 0;
    border: 0;
    background: transparent;
    color: #1a5276;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: $primary;
    }
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-user-info {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px 9px;
    border: 0;
    border-radius: 22px;
    background: transparent;
    color: #1a5276;
    font-family: inherit;
    cursor: pointer;
    transition: background-color .2s ease;

    &:hover,
    &:focus-visible {
      background: #edf8fb;
      outline: none;
    }

    .nav-user-icon {
      font-size: 25px;
      color: $primary;
    }

    .nav-user-caret {
      color: $text-light;
      font-size: 16px;
    }

    > div {
      display: flex;
      flex-direction: column;
      max-width: 150px;
      line-height: 1.25;
    }

    strong,
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      font-size: 13px;
    }

    span {
      color: $text-light;
      font-size: 11px;
    }
  }

  @media (max-width: 768px) {
    padding: 0 16px;

    .brand-name {
      display: none;
    }

    .nav-menu {
      gap: 12px;
      margin: 0 12px;
    }

    .nav-link {
      font-size: 13px;
    }

    .nav-user-info {
      padding: 4px;

      > div,
      .nav-user-caret {
        display: none;
      }
    }
  }
}

/* ===== Hero ===== */
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  min-height: calc(15vh - 64px);
  //padding: 60px 40px;
  background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%);

  // Banner 輪播覆蓋全寬
  .hero-carousel {
    width: 100%;
    flex: 1;
  }

  .hero-banner-item {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #e8f4f8;
    display: flex;
    align-items: flex-end;
    &.no-image {
      background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%);
    }
  }

  .hero-banner-overlay {
    width: 100%;
    padding: 24px 40px;
    background: linear-gradient(transparent, rgba(0,0,0,.55));
  }

  .hero-banner-title {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0 0 8px;
    text-shadow: 0 1px 3px rgba(0,0,0,.4);
  }

  .hero-banner-subtitle {
    font-size: 15px;
    color: rgba(255,255,255,.85);
    margin: 0;
  }

  .hero-content {
    flex: 1;
    max-width: 560px;
  }

  .hero-badge {
    display: inline-block;
    padding: 4px 14px;
    background: rgba($primary, 0.1);
    color: $primary;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .hero-title {
    font-size: clamp(36px, 5vw, 56px);
    font-weight: 800;
    color: #1a1a1a;
    line-height: 1.2;
    margin: 0 0 20px;
  }

  .hero-desc {
    font-size: 16px;
    color: #666;
    line-height: 1.8;
    margin-bottom: 32px;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .hero-visual {
    flex: 1;
    max-width: 480px;
    display: flex;
    justify-content: center;
  }

  .hero-card-stack {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    width: 100%;
    max-width: 400px;
  }

  .hero-stat {
    background: #fff;
    border-radius: 16px;
    padding: 28px 20px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    .stat-number {
      font-size: 28px;
      font-weight: 800;
      color: $primary;
    }

    .stat-label {
      font-size: 13px;
      color: #888;
      margin-top: 6px;
    }
  }
}

/* ===== Sections Shared ===== */
.section {
  padding: 80px 0;
}

// 統一內容容器：最大寬 1200px 、水平置中
.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header--with-action {
  position: relative;
}

.news-more {
  position: absolute;
  right: 0;
  bottom: 0;
}

.section-title {
  font-size: 32px;
  font-weight: var(--font-weight-heading);
  color: var(--color-text-primary);
  margin: 0 0 12px;
  line-height: var(--line-height-heading);
}

.section-desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-body);
}

/* ===== News Section ===== */
.news-section {
  background-color: var(--color-background);
}

// CSS Grid 響應式三欄 → 平板兩欄 → 手機單欄
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  min-height: 160px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.news-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-card);
  padding: 24px;
  transition: var(--transition-base);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
    outline: none;
    border-color: rgba(7, 93, 186, 0.35);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  &__date {
    font-size: 12px;
    color: var(--color-text-secondary);
    opacity: 0.7;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0 0 10px;
    line-height: 1.4;
  }

  &__cover {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: clamp(110px, 12vw, 150px);
    margin: 0 0 12px;
    overflow: hidden;
    background: #f5f7fa;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__summary {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
    flex: 1;
  }
}

.news-empty {
  grid-column: 1 / -1;
}

.news-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 14px;
}

@media (max-width: 640px) {
  .news-more {
    position: static;
    margin-top: 8px;
  }
}

/* ===== Products Section ===== */
.products-section {
  background-color: var(--color-surface);
}

// CSS Grid 響應式三欄 → 平板兩欄 → 手機單欄
.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.product-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-base);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: var(--transition-base);
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
    border-color: rgba(37, 99, 235, 0.2);
  }

  &__image {
    width: 100%;
    height: 180px;
    background-color: var(--color-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    i {
      font-size: 42px;
      color: var(--color-primary);
    }
  }

  &__body {
    flex: 1;
    width: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
  }

  &__category {
    color: var(--color-primary);
    font-size: 12px;
    margin-bottom: 6px;
  }

  &__name {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin: 0 0 10px;
    line-height: var(--line-height-heading);
  }

  &__desc {
    font-size: 14px;
    color: var(--color-text-secondary);
    line-height: var(--line-height-body);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__price {
    color: var(--color-primary);
    font-size: 16px;
    margin-top: auto;
    padding-top: 16px;
  }
}

.products-empty {
  grid-column: 1 / -1;
}

.products-error,
.products-more {
  margin-top: 20px;
  text-align: center;
}

.products-error {
  color: var(--color-text-secondary);
}

/* ===== About Section ===== */
.about-section {
  background: linear-gradient(135deg, #E8F7F5 0%, #DDF2F2 54%, #F6FBFC 100%);
}

// 兩欄排列：內容左 / 數據右
.about-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 60px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

.about-layout__content {
  min-width: 0;
  min-height: 180px;
  overflow: hidden;
}

.about-title {
  font-size: 32px;
  font-weight: var(--font-weight-heading);
  color: var(--color-text-primary);
  margin: 0 0 16px;
  line-height: var(--line-height-heading);
}

.about-summary {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: var(--line-height-body);
  margin: 0 0 16px;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.about-rich-content {
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
    display: block;
    max-width: 100% !important;
    height: auto !important;
    margin: 12px auto;
    object-fit: contain;
  }

  :deep(video),
  :deep(iframe) {
    max-width: 100% !important;
  }

  :deep(pre) {
    max-width: 100%;
    overflow-x: auto;
    white-space: pre-wrap !important;
  }

  :deep(table) {
    display: block;
    width: 100% !important;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.5rem;
  }
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 20px 0 0;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--color-text-primary);
    padding: 6px 0;

    i {
      font-size: 18px;
      color: var(--color-primary);
      flex-shrink: 0;
    }
  }
}

// 數據卡片 Grid
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-block {
  background-color: var(--color-surface);
  border-radius: var(--border-radius-base);
  padding: 32px 20px;
  text-align: center;
  box-shadow: var(--shadow-card);
  transition: var(--transition-base);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-card-hover);
  }

  // 重點數據放大加粗
  &__value {
    display: block;
    font-size: 36px;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1;
    letter-spacing: -0.5px;
  }

  &__label {
    display: block;
    font-size: 13px;
    color: var(--color-text-secondary);
    font-weight: 500;
  }
}

/* ===== Footer ===== */
.footer {
  background: #E7F4F5;
  padding: 32px 0;

  .footer-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1a5276;
    font-size: 15px;
    font-weight: 600;
  }

  .footer-logo {
    height: 42px;
    object-fit: contain;
    filter: none;
    opacity: 1;
  }

  .footer-copy {
    color: #2e6fa3;
    font-size: 13px;
    margin: 0;
  }
}
</style>
