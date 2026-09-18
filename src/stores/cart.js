import { defineStore } from "pinia";
import { ShoppingCartAPI } from "@/api/shoppingCart";

export const useCartStore = defineStore("cart", () => {
  const companyName = ref("");
  const itemCount = ref(0);
  const totalQuantity = ref(0);
  const totalAmount = ref(0);
  const items = ref([]);
  const loading = ref(false);
  const mutating = ref(false);
  const errorMessage = ref("");
  const lastLoadedAt = ref(null);

  // 保留既有畫面使用的名稱，實際金額與數量一律採後端計算結果。
  const total = computed(() => totalAmount.value);
  const totalQty = computed(() => totalQuantity.value);
  const hasUnavailableItems = computed(() =>
    items.value.some((item) => item.isAvailable === false)
  );

  const applyCart = (cart = {}) => {
    companyName.value = cart.companyName || "";
    itemCount.value = Number(cart.itemCount) || 0;
    totalQuantity.value = Number(cart.totalQuantity) || 0;
    totalAmount.value = Number(cart.totalAmount) || 0;
    items.value = Array.isArray(cart.items) ? cart.items : [];
    lastLoadedAt.value = new Date();
  };

  const reset = () => {
    companyName.value = "";
    itemCount.value = 0;
    totalQuantity.value = 0;
    totalAmount.value = 0;
    items.value = [];
    loading.value = false;
    mutating.value = false;
    errorMessage.value = "";
    lastLoadedAt.value = null;
  };

  const fetchCart = async ({ silent = false } = {}) => {
    if (loading.value) return true;

    if (!silent) loading.value = true;
    errorMessage.value = "";
    try {
      const response = await ShoppingCartAPI.GetList();
      if (response.data?.success !== true || !response.data?.data) {
        throw new Error(response.data?.message || "購物車資料格式不正確");
      }
      applyCart(response.data.data);
      return true;
    } catch (error) {
      errorMessage.value = error.response?.data?.message || "無法取得購物車資料";
      if (error.response?.status === 401) reset();
      return false;
    } finally {
      loading.value = false;
    }
  };

  const addItem = async (product, quantity = 1) => {
    const productId = product?.productId ?? product?.ProductID;
    if (!productId || mutating.value) return false;

    mutating.value = true;
    try {
      const response = await ShoppingCartAPI.AddItem({
        ProductID: productId,
        ProductSKUID: product.productSkuId ?? product.ProductSKUID ?? null,
        Quantity: quantity,
        CustomizationRemark: null,
      });
      if (response.data?.success !== true || !response.data?.data) {
        throw new Error(response.data?.message || "加入購物車失敗");
      }
      applyCart(response.data.data);
      ElMessage.success(response.data.message || "商品已加入公司購物車");
      return true;
    } catch (error) {
      if (error.response?.status === 409) {
        ElMessage.warning(error.response.data?.message || "商品目前無法加入購物車");
      } else if (!error.response) {
        ElMessage.error("無法連線至購物車服務");
      }
      return false;
    } finally {
      mutating.value = false;
    }
  };

  const removeItem = async (cartItemId) => {
    if (!cartItemId || mutating.value) return false;

    mutating.value = true;
    try {
      const response = await ShoppingCartAPI.DeleteItem(cartItemId);
      if (response.data?.success !== true || !response.data?.data) {
        throw new Error(response.data?.message || "刪除購物車項目失敗");
      }
      applyCart(response.data.data);
      ElMessage.success(response.data.message || "購物車項目已刪除");
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        await fetchCart({ silent: true });
        ElMessage.warning("此商品可能已由同公司其他人員移除，購物車已重新整理");
      }
      return false;
    } finally {
      mutating.value = false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    const nextQuantity = Number(quantity);
    if (!cartItemId || !Number.isFinite(nextQuantity) || nextQuantity <= 0 || mutating.value) {
      return false;
    }

    mutating.value = true;
    try {
      const response = await ShoppingCartAPI.UpdateQuantity(cartItemId, {
        Quantity: nextQuantity,
      });
      if (response.data?.success !== true || !response.data?.data) {
        throw new Error(response.data?.message || "更新購物車商品數量失敗");
      }
      applyCart(response.data.data);
      ElMessage.success(response.data.message || "購物車商品數量已更新");
      return true;
    } catch (error) {
      await fetchCart({ silent: true });
      if (error.response?.status === 404) {
        ElMessage.warning("此商品可能已由同公司其他人員移除，購物車已重新整理");
      } else if (error.response?.status === 409) {
        ElMessage.warning(error.response.data?.message || "目前無法更新此商品數量");
      } else if (!error.response) {
        ElMessage.error("無法連線至購物車服務");
      }
      return false;
    } finally {
      mutating.value = false;
    }
  };

  const clearCart = async () => {
    if (mutating.value) return false;

    mutating.value = true;
    try {
      const response = await ShoppingCartAPI.Clear();
      if (response.data?.success !== true || !response.data?.data) {
        throw new Error(response.data?.message || "清空購物車失敗");
      }
      applyCart(response.data.data);
      ElMessage.success(response.data.message || "購物車已清空");
      return true;
    } catch (error) {
      return false;
    } finally {
      mutating.value = false;
    }
  };

  return {
    companyName,
    itemCount,
    totalQuantity,
    totalAmount,
    items,
    loading,
    mutating,
    errorMessage,
    lastLoadedAt,
    total,
    totalQty,
    hasUnavailableItems,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    reset,
  };
});
