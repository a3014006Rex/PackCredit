<script setup>
import { AuthAPI } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const isLoggedIn = computed(() => Boolean(authStore.user.token));

const loading = ref(false);
const cartVisible = ref(false);
const selectedCategory = ref("");

const data = reactive({
  list: [],
  pagination: null,
});

const categories = ref([]);

const form = reactive({
  keyword: "",
  categoryId: null,
  page: 1,
  pageSize: 20,
});

const initList = async () => {
  loading.value = true;
  try {
    const queryData = {
      ...form,
      keyword: form.keyword?.trim() || null,
    };
    const res = await AuthAPI.GetProductList(queryData);
    data.list = res.data.success && Array.isArray(res.data.data) ? res.data.data : [];
    data.pagination = res.data.pagination ?? null;
    categories.value = Array.isArray(res.data.categories) ? res.data.categories : [];
  } catch (e) {
    console.log(e);
    data.list = [];
    data.pagination = null;
  }
  loading.value = false;
};

const handleCategoryFilter = (catId) => {
  selectedCategory.value = catId;
  form.categoryId = catId || null;
  form.page = 1;
  initList();
};

const handleSearch = () => {
  form.page = 1;
  initList();
};

const handlePageChange = (page) => {
  form.page = page;
  initList();
};

const formatPrice = (value) => Number(value).toLocaleString("zh-TW");

const formatProductPrice = (item) => {
  if (item.price == null) return "價格請洽詢";
  if (item.maximumPrice != null && item.maximumPrice !== item.price) {
    return `NT$ ${formatPrice(item.price)} ～ ${formatPrice(item.maximumPrice)}`;
  }
  return `NT$ ${formatPrice(item.price)}`;
};

const handleAddToCart = (item) => {
  if (!isLoggedIn.value) {
    ElMessage.info("請先登入會員後再購買商品");
    router.push("/login");
    return;
  }

  cartStore.addItem(item);
};

const handleCheckout = async () => {
  if (!isLoggedIn.value) {
    ElMessage.info("請先登入會員後再進行結帳");
    router.push("/login");
    return;
  }

  try {
    const response = await AuthAPI.GetMemberProfile();
    const profile = response.data?.data;
    if (!response.data?.success || !profile) return;
    if (profile.company?.memberStatusCode !== "Member_Status_NORMAL") {
      ElMessage.warning("請先完成首次儲值，後台確認入帳後才能進行交易");
      router.push({ name: "TopUp" });
      return;
    }
    if (!profile.account?.canPlaceOrder) {
      ElMessage.error("目前帳號沒有建立訂單權限，請洽公司管理者");
      return;
    }
    router.push("/order/create");
  } catch (error) {
    console.log("check member order access error", error);
  }
};

onMounted(() => {
  initList();
});
</script>

<template>
  <div class="shop-page">
    <!-- 頂部歡迎列 -->
    <div class="shop-header">
      <div class="welcome-text">
        <template v-if="isLoggedIn">
          <span>歡迎，</span>
          <strong>{{ authStore.user.companyName || authStore.user.userName }}</strong>
          <span v-if="authStore.user.companyName" class="user-sub">{{ authStore.user.userName }}</span>
        </template>
        <template v-else>
          <strong>訪客瀏覽模式</strong>
          <span class="user-sub">可檢視商品，登入會員後即可購買</span>
        </template>
      </div>
      <div class="header-actions">
        <el-input
          v-model="form.keyword"
          placeholder="搜尋商品名稱..."
          clearable
          size="default"
          style="width:240px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix><i class="bx bx-search"></i></template>
        </el-input>
        <el-badge
          v-if="isLoggedIn"
          :value="cartStore.totalQty"
          :hidden="!cartStore.totalQty"
          type="danger"
        >
          <el-button type="primary" @click="cartVisible = true">
            <i class="bx bx-cart" style="margin-right:4px"></i>
            購物車
          </el-button>
        </el-badge>
      </div>
    </div>

    <!-- 分類篩選 -->
    <div class="category-bar">
      <el-button
        :type="selectedCategory === '' ? 'primary' : ''"
        round
        size="small"
        @click="handleCategoryFilter('')"
      >全部商品</el-button>
      <el-button
        v-for="cat in categories"
        :key="cat.categoryId"
        :type="selectedCategory === cat.categoryId ? 'primary' : ''"
        round
        size="small"
        @click="handleCategoryFilter(cat.categoryId)"
      >{{ cat.name }}</el-button>
    </div>

    <!-- 商品列表 -->
    <div v-loading="loading" class="product-grid">
      <div v-if="!loading && !data.list.length" class="empty-state">
        <i class="bx bx-package"></i>
        <p>暫無商品</p>
      </div>

      <div v-for="item in data.list" :key="item.productId" class="product-card">
        <div class="product-img">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
          <div v-else class="no-img"><i class="bx bx-image-alt"></i></div>
        </div>
        <div class="product-body">
          <div class="product-category">{{ item.categoryName }}</div>
          <div class="product-name">{{ item.name }}</div>
          <div class="product-desc" v-if="item.specification">{{ item.specification }}</div>
          <div class="product-footer">
            <div class="product-price">
              {{ formatProductPrice(item) }}
              <span class="unit" v-if="item.unit"> / {{ item.unit }}</span>
            </div>
            <el-button
              type="primary"
              size="small"
              :disabled="item.stock <= 0 || item.price == null"
              :plain="!isLoggedIn"
              @click="handleAddToCart(item)"
            >
              <i class="bx bx-cart-add"></i>
              {{ item.stock <= 0 ? '暫無庫存' : item.price == null ? '價格請洽詢' : isLoggedIn ? '加入購物車' : '登入後購買' }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分頁 -->
    <div class="pagination-bar" v-if="data.pagination?.totalCount > form.pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="data.pagination.totalCount"
        :page-size="data.pagination.pageSize"
        :current-page="data.pagination.currentPage"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 購物車 Drawer -->
    <el-drawer v-model="cartVisible" title="購物車" direction="rtl" size="400px">
      <div v-if="!cartStore.items.length" class="cart-empty">
        <i class="bx bx-cart"></i>
        <p>購物車是空的</p>
      </div>
      <div v-else class="cart-content">
        <div v-for="item in cartStore.items" :key="item.productId" class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">{{ item.name }}</div>
            <div class="cart-item-price">NT$ {{ $price(item.price) }}</div>
          </div>
          <div class="cart-item-qty">
            <el-input-number
              v-model="item.qty"
              :min="0"
              :max="999"
              size="small"
              controls-position="right"
              @change="(val) => cartStore.updateQty(item.productId, val)"
            />
          </div>
        </div>
        <div class="cart-total">
          <span>合計</span>
          <strong>NT$ {{ $price(cartStore.total) }}</strong>
        </div>
        <div class="cart-actions">
          <el-button @click="cartStore.clear()">清空購物車</el-button>
          <el-button type="primary" @click="handleCheckout">前往結帳</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.shop-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.shop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  .welcome-text {
    font-size: 16px;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: 4px;
    strong { color: $primary; font-size: 18px; }
    .user-sub { font-size: 13px; color: $text-light; margin-left: 4px; }
  }
  .header-actions { display: flex; align-items: center; gap: 10px; }
}

.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  min-height: 200px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: $text-light;
  padding: 60px 0;
  i { font-size: 48px; display: block; margin-bottom: 8px; }
}

.product-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
  transition: transform .2s, box-shadow .2s;
  display: flex;
  flex-direction: column;
  &:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,.13); }
}

.product-img {
  height: 160px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  img { width: 100%; height: 100%; object-fit: cover; }
  .no-img { color: #c0c4cc; font-size: 40px; }
}

.product-body {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-category { font-size: 11px; color: $text-light; }
.product-name { font-size: 15px; font-weight: 600; color: $text-primary; }
.product-desc { font-size: 12px; color: $text-light; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

.product-footer {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px;
}

.product-price {
  font-size: 16px;
  font-weight: 700;
  color: $primary;
  .unit { font-size: 12px; font-weight: 400; color: $text-light; }
}

.pagination-bar {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.cart-empty {
  text-align: center;
  color: $text-light;
  padding: 60px 0;
  i { font-size: 48px; display: block; margin-bottom: 8px; }
}

.cart-content { display: flex; flex-direction: column; gap: 12px; }

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.cart-item-info {
  flex: 1;
  .cart-item-name { font-size: 14px; font-weight: 500; }
  .cart-item-price { font-size: 13px; color: $primary; }
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  padding: 12px 0;
  border-top: 2px solid var(--el-border-color);
  strong { color: $primary; font-size: 18px; }
}

.cart-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style>
