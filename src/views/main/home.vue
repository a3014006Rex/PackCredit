<script setup>
import { AuthAPI } from "@/api/auth";
import { Order } from "@/api/order";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { createCheckoutRequestId } from "@/utils/checkoutRequestId";

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const isLoggedIn = computed(() => Boolean(authStore.user.token));

const loading = ref(false);
const cartVisible = ref(false);
const addingProductId = ref(null);
const deletingItemId = ref(null);
const updatingItemId = ref(null);
const clearingCart = ref(false);
const checkoutVisible = ref(false);
const checkoutLoading = ref(false);
const checkoutSubmitting = ref(false);
const checkoutPreview = ref(null);
const pendingCheckoutId = ref(null);
const checkoutForm = reactive({ receiverName: "", receiverPhone: "", shippingAddress: "", customerRemark: "" });
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

const handleAddToCart = async (item) => {
  if (!isLoggedIn.value) {
    ElMessage.info("請先登入會員後再購買商品");
    router.push("/login");
    return;
  }

  addingProductId.value = item.productId;
  try {
    await cartStore.addItem(item);
  } finally {
    addingProductId.value = null;
  }
};

const handleOpenCart = async () => {
  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }

  cartVisible.value = true;
  await cartStore.fetchCart();
  if (pendingCheckoutId.value) await handleCheckout();
};

const handleRemoveCartItem = async (item) => {
  try {
    await ElMessageBox.confirm(
      `確定要從公司共用購物車移除「${item.productName}」嗎？`,
      "移除購物車商品",
      { confirmButtonText: "確認移除", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    return;
  }

  deletingItemId.value = item.cartItemId;
  try {
    await cartStore.removeItem(item.cartItemId);
  } finally {
    deletingItemId.value = null;
  }
};

const handleUpdateCartItemQuantity = async (item, value) => {
  const quantity = Number(value);
  const currentQuantity = Number(item.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    ElMessage.warning("商品數量必須大於 0");
    await cartStore.fetchCart({ silent: true });
    return;
  }
  if (quantity === currentQuantity) return;

  updatingItemId.value = item.cartItemId;
  try {
    await cartStore.updateQuantity(item.cartItemId, quantity);
  } finally {
    updatingItemId.value = null;
  }
};

const handleClearCart = async () => {
  try {
    await ElMessageBox.confirm(
      "清空後同公司所有人員都會看到空的購物車，確定繼續嗎？",
      "清空公司購物車",
      { confirmButtonText: "確認清空", cancelButtonText: "取消", type: "warning" }
    );
  } catch {
    return;
  }

  clearingCart.value = true;
  try {
    await cartStore.clearCart();
  } finally {
    clearingCart.value = false;
  }
};

const handleCheckout = async () => {
  if (!isLoggedIn.value) {
    ElMessage.info("請先登入會員後再進行結帳");
    router.push("/login");
    return;
  }

  const pending = readPendingCheckout();
  if (pending) {
    try {
      const response = await Order.GetByRequest(pending.checkoutRequestID);
      if (response.data?.success && response.data?.data) {
        await finishCheckout(response.data.data);
        return;
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        ElMessage.warning("上次結帳結果尚未確認，請稍後再查詢");
        return;
      }
    }
    try {
      await ElMessageBox.confirm(
        "上次結帳尚未找到訂單。可用原結帳識別碼安全重送，請勿重新建立另一筆結帳。",
        "確認上次結帳",
        { confirmButtonText: "重送原請求", cancelButtonText: "稍後再查", type: "warning" }
      );
      await submitCheckoutRequest(pending);
    } catch {
      // 使用者選擇稍後查詢。
    }
    return;
  }

  const cartLoaded = await cartStore.fetchCart();
  if (!cartLoaded) return;
  if (!cartStore.items.length) {
    ElMessage.info("購物車目前沒有商品");
    return;
  }
  if (cartStore.hasUnavailableItems) {
    ElMessage.warning("購物車包含目前無法購買的商品，請先移除後再結帳");
    return;
  }

  checkoutLoading.value = true;
  try {
    const response = await Order.CheckoutPreview();
    if (!response.data?.success || !response.data?.data) throw new Error("結帳預覽資料不正確");
    checkoutPreview.value = response.data.data;
    checkoutForm.receiverName = response.data.data.receiverName || "";
    checkoutForm.receiverPhone = response.data.data.receiverPhone || "";
    checkoutForm.shippingAddress = response.data.data.shippingAddress || "";
    checkoutForm.customerRemark = "";
    cartVisible.value = false;
    checkoutVisible.value = true;
  } catch (error) {
    if (error.response?.status === 409) {
      ElMessage.warning(error.response.data?.message || "購物車或公司儲值金目前無法結帳");
      await cartStore.fetchCart({ silent: true });
    } else if (error.response?.status === 403) {
      ElMessage.warning(error.response.data?.message || "目前沒有下單權限");
    } else if (!error.response) {
      ElMessage.error("無法取得結帳預覽，請稍後重試");
    }
  } finally {
    checkoutLoading.value = false;
  }
};

const pendingStorageKey = () =>
  `packcredit-pending-checkout:${authStore.user.userId || authStore.user.email || authStore.user.userName || "member"}`;

const readPendingCheckout = () => {
  try {
    const value = sessionStorage.getItem(pendingStorageKey());
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const savePendingCheckout = (payload) => {
  sessionStorage.setItem(pendingStorageKey(), JSON.stringify(payload));
  pendingCheckoutId.value = payload.checkoutRequestID;
};
const clearPendingCheckout = () => {
  sessionStorage.removeItem(pendingStorageKey());
  pendingCheckoutId.value = null;
};

const finishCheckout = async (order) => {
  clearPendingCheckout();
  checkoutVisible.value = false;
  cartVisible.value = false;
  await cartStore.fetchCart({ silent: true });
  ElMessage.success(order.paymentStatusCode === "REFUNDED"
    ? `訂單 ${order.orderNo} 已取消並回補儲值金`
    : `訂單 ${order.orderNo} 已成立，儲值金已扣抵`);
  router.push(`/order/${order.orderID}`);
};

const submitCheckoutRequest = async (payload) => {
  if (checkoutSubmitting.value) return;
  checkoutSubmitting.value = true;
  try {
    const response = await Order.Checkout(payload);
    if (!response.data?.success || !response.data?.data) throw new Error("結帳回應資料不正確");
    await finishCheckout(response.data.data);
  } catch (error) {
    const status = error.response?.status;
    if (status === 400 || status === 403 || status === 409) {
      clearPendingCheckout();
      checkoutVisible.value = false;
      await cartStore.fetchCart({ silent: true });
      ElMessage.warning(error.response.data?.message || "結帳資料已變更，請重新確認");
    } else {
      try {
        const recovered = await Order.GetByRequest(payload.checkoutRequestID);
        if (recovered.data?.success && recovered.data?.data) {
          await finishCheckout(recovered.data.data);
          return;
        }
      } catch {
        // 查詢尚未找到訂單時仍保留原請求，後續可以安全重送。
      }
      ElMessage.warning("結帳結果尚未確認；請再次進入購物車查詢或重送原請求");
    }
  } finally {
    checkoutSubmitting.value = false;
  }
};

const confirmCheckout = async () => {
  if (!checkoutPreview.value || checkoutSubmitting.value) return;
  const receiverName = checkoutForm.receiverName.trim();
  const receiverPhone = checkoutForm.receiverPhone.trim();
  const shippingAddress = checkoutForm.shippingAddress.trim();
  if (!receiverName || !receiverPhone || !shippingAddress) {
    ElMessage.warning("請填寫收件人、電話與完整收件地址");
    return;
  }

  let checkoutRequestID;
  try {
    checkoutRequestID = createCheckoutRequestId();
  } catch {
    ElMessage.error("此瀏覽器無法產生安全的結帳識別碼，訂單尚未送出");
    return;
  }

  const payload = {
    checkoutRequestID,
    cartFingerprint: checkoutPreview.value.cartFingerprint,
    receiverName,
    receiverPhone,
    shippingAddress,
    customerRemark: checkoutForm.customerRemark.trim() || null,
  };
  try {
    savePendingCheckout(payload);
  } catch {
    ElMessage.error("無法保存結帳識別碼，訂單尚未送出；請允許網站儲存資料後重試");
    return;
  }
  await submitCheckoutRequest(payload);
};

watch(
  () => authStore.user.token,
  async (token) => {
    cartStore.reset();
    pendingCheckoutId.value = token ? readPendingCheckout()?.checkoutRequestID || null : null;
    if (token) {
      await cartStore.fetchCart();
    } else {
      cartVisible.value = false;
    }
  },
  { immediate: true }
);

const handleWindowFocus = () => {
  if (isLoggedIn.value && cartVisible.value) {
    cartStore.fetchCart({ silent: true });
  }
};

onMounted(() => {
  initList();
  window.addEventListener("focus", handleWindowFocus);
});

onUnmounted(() => {
  window.removeEventListener("focus", handleWindowFocus);
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
          <el-button type="primary" @click="handleOpenCart">
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
              :loading="addingProductId === item.productId"
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
    <el-drawer v-model="cartVisible" title="購物車" direction="rtl" size="420px">
      <div v-loading="cartStore.loading" class="cart-drawer-body">
        <div v-if="cartStore.companyName" class="cart-company">
          <i class="bx bx-buildings"></i>
          <div>
            <strong>{{ cartStore.companyName }}</strong>
            <small>公司共用購物車</small>
          </div>
        </div>
        <el-alert
          v-if="pendingCheckoutId"
          type="warning"
          title="上次結帳結果待確認"
          :closable="false"
          class="cart-error"
        >
          <template #default>
            <el-button link type="primary" @click="handleCheckout">查詢或重送原請求</el-button>
          </template>
        </el-alert>

        <el-alert
          v-if="cartStore.errorMessage && !cartStore.loading"
          :title="cartStore.errorMessage"
          type="error"
          show-icon
          :closable="false"
          class="cart-error"
        >
          <template #default>
            <el-button link type="primary" @click="cartStore.fetchCart()">重新載入</el-button>
          </template>
        </el-alert>

        <div v-if="!cartStore.loading && !cartStore.errorMessage && !cartStore.items.length" class="cart-empty">
          <i class="bx bx-cart"></i>
          <p>購物車是空的</p>
          <small>同公司人員加入的商品會顯示在這裡</small>
        </div>
        <div v-else-if="cartStore.items.length" class="cart-content">
          <div v-for="item in cartStore.items" :key="item.cartItemId" class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-name">{{ item.productName }}</div>
              <div v-if="item.skuName || item.specification" class="cart-item-meta">
                {{ [item.skuName, item.specification].filter(Boolean).join('・') }}
              </div>
              <el-tag v-if="!item.isAvailable" type="danger" size="small">目前無法購買</el-tag>
              <div class="cart-item-price">
                單價 NT$ {{ $price(item.unitPrice) }}{{ item.unit ? ` / ${item.unit}` : '' }}
              </div>
              <div class="cart-item-quantity">
                <span>數量</span>
                <el-input-number
                  class="cart-quantity-input"
                  :model-value="Number(item.quantity)"
                  :min="1"
                  :max="999999"
                  :step="1"
                  size="small"
                  controls-position="right"
                  :disabled="cartStore.mutating || !item.isAvailable"
                  :aria-label="`調整 ${item.productName} 數量`"
                  @change="(value) => handleUpdateCartItemQuantity(item, value)"
                />
                <i
                  v-if="updatingItemId === item.cartItemId"
                  class="bx bx-loader-alt bx-spin cart-item-updating"
                  aria-label="數量更新中"
                ></i>
              </div>
              <div class="cart-item-subtotal">小計 NT$ {{ $price(item.lineAmount) }}</div>
            </div>
            <el-button
              type="danger"
              text
              :loading="deletingItemId === item.cartItemId"
              :disabled="cartStore.mutating && deletingItemId !== item.cartItemId"
              aria-label="移除購物車商品"
              @click="handleRemoveCartItem(item)"
            >
              <i class="bx bx-trash"></i>
            </el-button>
          </div>
          <div class="cart-summary">
            <span>共 {{ cartStore.itemCount }} 項，數量 {{ cartStore.totalQty }}</span>
          </div>
          <div class="cart-total">
            <span>合計</span>
            <strong>NT$ {{ $price(cartStore.total) }}</strong>
          </div>
          <div class="cart-actions">
            <el-button
              :loading="clearingCart"
              :disabled="cartStore.mutating"
              @click="handleClearCart"
            >清空購物車</el-button>
            <el-button
              type="primary"
              :loading="checkoutLoading"
              :disabled="cartStore.mutating || cartStore.hasUnavailableItems || checkoutSubmitting"
              @click="handleCheckout"
            >前往結帳</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <el-dialog
      v-model="checkoutVisible"
      title="確認公司訂單"
      width="min(94vw, 680px)"
      append-to-body
      :close-on-click-modal="false"
      :close-on-press-escape="!checkoutSubmitting"
      :show-close="!checkoutSubmitting"
    >
      <template v-if="checkoutPreview">
        <p class="checkout-hint">{{ checkoutPreview.companyName }} 的訂單將於確認後立即扣抵儲值金。</p>
        <el-table :data="checkoutPreview.items" size="small" max-height="260">
          <el-table-column label="商品" min-width="180">
            <template #default="{ row }">
              <div>{{ row.productName }}</div>
              <small>{{ row.skuName }}</small>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="數量" width="70" />
          <el-table-column label="單價" width="100">
            <template #default="{ row }">NT$ {{ $price(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="小計" width="110">
            <template #default="{ row }">NT$ {{ $price(row.lineAmount) }}</template>
          </el-table-column>
        </el-table>
        <div class="checkout-total">應扣儲值金：<strong>NT$ {{ $price(checkoutPreview.totalAmount) }}</strong></div>
        <el-form :model="checkoutForm" label-position="top" class="checkout-form">
          <el-form-item label="收件人姓名" required>
            <el-input v-model="checkoutForm.receiverName" maxlength="100" />
          </el-form-item>
          <el-form-item label="收件電話" required>
            <el-input v-model="checkoutForm.receiverPhone" maxlength="50" />
          </el-form-item>
          <el-form-item label="完整收件地址" required>
            <el-input v-model="checkoutForm.shippingAddress" maxlength="1000" />
          </el-form-item>
          <el-form-item label="訂單備註">
            <el-input v-model="checkoutForm.customerRemark" type="textarea" :rows="2" maxlength="1000" show-word-limit />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button :disabled="checkoutSubmitting" @click="checkoutVisible = false; cartVisible = true">返回購物車</el-button>
        <el-button type="primary" :loading="checkoutSubmitting" @click="confirmCheckout">確認下單並扣點</el-button>
      </template>
    </el-dialog>
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
  small { font-size: 12px; }
}

.checkout-hint { margin: 0 0 14px; color: $text-light; }
.checkout-total { margin: 14px 0; text-align: right; }
.checkout-total strong { color: $primary; font-size: 18px; }
.checkout-form { margin-top: 18px; }

.cart-drawer-body { min-height: 180px; }
.cart-error { margin-bottom: 14px; }

.cart-company {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  color: $text-primary;
  i { color: $primary; font-size: 24px; }
  div { display: flex; flex-direction: column; }
  small { color: $text-light; font-size: 11px; }
}

.cart-content { display: flex; flex-direction: column; gap: 12px; }

.cart-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.cart-item-info {
  min-width: 0;
  flex: 1;
  .cart-item-name { font-size: 14px; font-weight: 500; }
  .cart-item-meta { margin: 2px 0 5px; color: $text-light; font-size: 12px; }
  .cart-item-price { margin-top: 5px; color: $text-light; font-size: 12px; }
  .cart-item-subtotal { margin-top: 7px; color: $primary; font-size: 13px; font-weight: 600; }
}

.cart-item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
  color: $text-light;
  font-size: 12px;
  :deep(.cart-quantity-input.el-input-number) {
    flex: 0 0 136px;
    width: 136px;
    min-width: 136px;
    max-width: 136px;
  }
  :deep(.cart-quantity-input .el-input) {
    width: 100%;
    min-width: 0;
    max-width: none;
  }
  .cart-item-updating { color: $primary; font-size: 16px; }
}

.cart-summary { color: $text-light; font-size: 12px; text-align: right; }

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
