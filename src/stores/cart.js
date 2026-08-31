import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", () => {
  const items = reactive([]);

  const total = computed(() =>
    items.reduce((sum, item) => sum + item.price * item.qty, 0)
  );

  const totalQty = computed(() => items.reduce((sum, item) => sum + item.qty, 0));

  const addItem = (product, qty = 1) => {
    const productId = product.productId ?? product.ProductID;
    const name = product.name ?? product.Name;
    const price = product.price ?? product.Price;
    const unit = product.unit ?? product.Unit;
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        productId,
        name,
        price,
        unit,
        qty,
      });
    }
    ElMessage.success(`已加入：${name}`);
  };

  const updateQty = (productId, qty) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    if (qty <= 0) {
      removeItem(productId);
    } else {
      item.qty = qty;
    }
  };

  const removeItem = (productId) => {
    const idx = items.findIndex((i) => i.productId === productId);
    if (idx >= 0) items.splice(idx, 1);
  };

  const clear = () => {
    items.splice(0, items.length);
  };

  return { items, total, totalQty, addItem, updateQty, removeItem, clear };
});
