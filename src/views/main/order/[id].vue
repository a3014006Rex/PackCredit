<script setup>
import { Order } from "@/api/order";
import { saveDownloadResponse } from "@/utils/companyDocument";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const downloadingInvoice = ref(false);
const loadError = ref("");
const order = ref(null);
const statusLabels = ref({});
const paymentLabels = ref({});
let latestRequest = 0;

const loadOptions = async () => {
  try {
    const response = await Order.Options();
    statusLabels.value = Object.fromEntries(
      (response.data?.data?.orderStatuses || []).map((option) => [option.value, option.label])
    );
    paymentLabels.value = Object.fromEntries(
      (response.data?.data?.paymentStatuses || []).map((option) => [option.value, option.label])
    );
  } catch {
    statusLabels.value = {};
    paymentLabels.value = {};
  }
};

const loadOrder = async () => {
  const requestId = ++latestRequest;
  loading.value = true;
  loadError.value = "";
  order.value = null;
  try {
    const response = await Order.GetById(route.params.id);
    if (requestId !== latestRequest) return;
    if (!response.data?.success || !response.data?.data) throw new Error("訂單資料格式不正確");
    order.value = response.data.data;
  } catch (error) {
    if (requestId !== latestRequest) return;
    order.value = null;
    loadError.value = error.response?.data?.message || "無法取得訂單明細，請稍後再試";
  } finally {
    if (requestId === latestRequest) loading.value = false;
  }
};
const formatDate = (value) => value ? new Date(value).toLocaleString("zh-TW") : "－";

const downloadInvoice = async () => {
  if (!order.value?.invoiceFile || downloadingInvoice.value) return;
  downloadingInvoice.value = true;
  try {
    const response = await Order.DownloadInvoice(order.value.orderID);
    saveDownloadResponse(response, order.value.invoiceFile.fileName || `發票-${order.value.orderNo}`);
  } catch {
    ElMessage.error("發票下載失敗，請確認帳號權限或稍後再試");
  } finally {
    downloadingInvoice.value = false;
  }
};

watch(() => route.params.id, loadOrder, { immediate: true });
onMounted(loadOptions);
</script>

<template>
  <InSideLayout click1="返回公司訂單" :loading="loading" @back="router.push('/order')" @click1="router.push('/order')">
    <template #title>訂單詳細</template>
    <template #main>
      <div v-loading="loading" class="order-detail-content">
        <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false">
          <el-button link type="primary" @click="loadOrder">重新載入</el-button>
        </el-alert>
        <template v-if="order">
          <el-card class="mb-4">
            <template #header><span>訂單資訊</span></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="訂單編號">{{ order.orderNo }}</el-descriptions-item>
              <el-descriptions-item label="下單時間">{{ formatDate(order.orderedAt) }}</el-descriptions-item>
              <el-descriptions-item label="訂購公司">{{ order.companyName }}</el-descriptions-item>
              <el-descriptions-item label="下單人員">{{ order.memberName }}</el-descriptions-item>
              <el-descriptions-item label="訂單狀態">{{ statusLabels[order.orderStatusCode] || order.orderStatusCode }}</el-descriptions-item>
              <el-descriptions-item label="付款狀態">{{ paymentLabels[order.paymentStatusCode] || order.paymentStatusCode }}</el-descriptions-item>
              <el-descriptions-item label="收件人">{{ order.receiverName }}</el-descriptions-item>
              <el-descriptions-item label="收件電話">{{ order.receiverPhone }}</el-descriptions-item>
              <el-descriptions-item label="收件地址" :span="2">{{ order.shippingAddress }}</el-descriptions-item>
              <el-descriptions-item label="訂單備註" :span="2">{{ order.customerRemark || '－' }}</el-descriptions-item>
              <el-descriptions-item label="發票附件" :span="2">
                <el-button v-if="order.invoiceFile" type="primary" link :loading="downloadingInvoice" @click="downloadInvoice">
                  下載 {{ order.invoiceFile.fileName || '發票' }}
                </el-button>
                <span v-else>尚未提供，或目前帳號沒有發票下載權限</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          <el-card>
            <template #header><span>商品明細</span></template>
            <el-table :data="order.items" stripe>
              <el-table-column prop="productName" label="商品名稱" min-width="180" />
              <el-table-column prop="specification" label="規格" min-width="140" />
              <el-table-column label="單價" width="130">
                <template #default="{ row }">NT$ {{ $price(row.unitPrice) }}</template>
              </el-table-column>
              <el-table-column prop="quantity" label="數量" width="100" />
              <el-table-column label="小計" width="130">
                <template #default="{ row }">NT$ {{ $price(row.lineAmount) }}</template>
              </el-table-column>
              <template #empty><el-empty description="此訂單沒有商品明細" /></template>
            </el-table>
            <div class="order-total">合計：<strong>NT$ {{ $price(order.totalAmount) }}</strong></div>
          </el-card>
        </template>
      </div>
    </template>
  </InSideLayout>
</template>

<style lang="scss" scoped>
.order-detail-content { min-height: 120px; }
.mb-4 { margin-bottom: 16px; }
.order-total { text-align: right; margin-top: 16px; }
.order-total strong { color: $primary; font-size: 18px; }
</style>
