<script setup>
import { Order } from "@/api/order";

const router = useRouter();
const route = useRoute();
const loading = ref(false);

const order = reactive({
  orderNo: "",
  memberName: "",
  memberEmail: "",
  memberPhone: "",
  orderStatus: "",
  totalAmount: 0,
  note: "",
  createDate: "",
  items: [],
});

const statusUpdateLoading = ref(false);
const selectedStatus = ref("");

const statusOptions = [
  { value: "已確認", label: "已確認" },
  { value: "備貨中", label: "備貨中" },
  { value: "已出貨", label: "已出貨" },
  { value: "已完成", label: "已完成" },
  { value: "已取消", label: "已取消" },
];

const initData = async () => {
  loading.value = true;
  try {
    const res = await Order.GetById(route.params.id);
    Object.assign(order, res.data);
    selectedStatus.value = order.orderStatus;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleUpdateStatus = async () => {
  if (!selectedStatus.value || selectedStatus.value === order.orderStatus) return;
  await ElMessageBox.confirm(
    `確定將訂單狀態更改為「${selectedStatus.value}」嗎？`,
    "系統提示",
    { confirmButtonText: "確認", cancelButtonText: "取消", type: "warning" }
  );
  statusUpdateLoading.value = true;
  try {
    await Order.UpdateStatus(route.params.id, { status: selectedStatus.value });
    order.orderStatus = selectedStatus.value;
    ElNotification({ title: "系統提示", message: "狀態更新成功", type: "success" });
  } catch (error) {
    console.log(error);
  }
  statusUpdateLoading.value = false;
};

const getOrderStatusClass = (status) => {
  const map = {
    "待確認": "blue", "已確認": "blue", "備貨中": "blue",
    "已出貨": "green", "已完成": "green",
    "已取消": "secondary", "退貨處理中": "blue", "已退款": "secondary",
  };
  return map[status] || "";
};

onMounted(() => {
  initData();
});
</script>

<template>
  <InSideLayout
    click1="返回列表"
    :loading="loading"
    @back="router.back()"
    @click1="router.back()"
  >
    <template #title>訂單詳細</template>

    <div v-loading="loading">
      <!-- 訂單基本資訊 -->
      <el-card class="mb-4">
        <template #header><span>訂單資訊</span></template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="訂單編號">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="建立時間">{{ order.createDate }}</el-descriptions-item>
          <el-descriptions-item label="採購企業">{{ order.memberName }}</el-descriptions-item>
          <el-descriptions-item label="聯絡電話">{{ order.memberPhone }}</el-descriptions-item>
          <el-descriptions-item label="電子郵件">{{ order.memberEmail }}</el-descriptions-item>
          <el-descriptions-item label="訂單金額">{{ $price(order.totalAmount) }} 元</el-descriptions-item>
          <el-descriptions-item label="訂單狀態">
            <span :class="getOrderStatusClass(order.orderStatus)">{{ order.orderStatus }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="備註">{{ order.note }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 更新狀態 -->
      <el-card class="mb-4" v-if="$auth('訂單管理', 'modify')">
        <template #header><span>更新訂單狀態</span></template>
        <el-form inline>
          <el-form-item label="變更狀態為">
            <el-select v-model="selectedStatus" style="width: 180px">
              <el-option
                v-for="opt in statusOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="statusUpdateLoading"
              @click="handleUpdateStatus"
            >確認更新</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 訂單商品明細 -->
      <el-card>
        <template #header><span>商品明細</span></template>
        <el-table :data="order.items" stripe>
          <el-table-column prop="productName" label="商品名稱" min-width="180" />
          <el-table-column prop="specification" label="規格" width="150" />
          <el-table-column label="單價" width="120">
            <template #default="{ row }">{{ $price(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="數量" width="100" />
          <el-table-column label="小計" width="130">
            <template #default="{ row }">{{ $price(row.subtotal) }}</template>
          </el-table-column>
        </el-table>
        <div class="order-total">
          合計：<strong>{{ $price(order.totalAmount) }}</strong> 元
        </div>
      </el-card>
    </div>
  </InSideLayout>
</template>

<style lang="scss" scoped>
.mb-4 { margin-bottom: 16px; }
.order-total {
  text-align: right;
  margin-top: 12px;
  font-size: 15px;
  color: $text-primary;
  strong { color: $primary; font-size: 18px; }
}
</style>
