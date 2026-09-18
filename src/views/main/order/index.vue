<script setup>
import { Order } from "@/api/order";

const router = useRouter();
const loading = ref(false);
const page = ref(1);
const pageSize = 10;
const totalCount = ref(0);
const rows = ref([]);
const loadError = ref("");
const filters = reactive({ orderNo: "", statusCode: "" });

const statusOptions = ref([]);
const statusLabels = computed(() => Object.fromEntries(
  statusOptions.value.map((option) => [option.value, option.label])
));
let latestRequest = 0;

const loadOptions = async () => {
  try {
    const response = await Order.Options();
    statusOptions.value = response.data?.data?.orderStatuses || [];
  } catch {
    statusOptions.value = [];
  }
};

const loadOrders = async () => {
  const requestId = ++latestRequest;
  loading.value = true;
  loadError.value = "";
  try {
    const response = await Order.List({
      page: page.value,
      pageSize,
      orderNo: filters.orderNo.trim() || undefined,
      statusCode: filters.statusCode || undefined,
    });
    if (requestId !== latestRequest) return;
    if (!response.data?.success || !response.data?.data) throw new Error("訂單資料格式不正確");
    rows.value = response.data.data.items || [];
    totalCount.value = response.data.data.totalCount || 0;
  } catch (error) {
    if (requestId !== latestRequest) return;
    rows.value = [];
    totalCount.value = 0;
    loadError.value = error.response?.data?.message || "無法取得公司訂單，請稍後再試";
  } finally {
    if (requestId === latestRequest) loading.value = false;
  }
};

const search = () => { page.value = 1; loadOrders(); };
const reset = () => { filters.orderNo = ""; filters.statusCode = ""; search(); };
const formatDate = (value) => value ? new Date(value).toLocaleString("zh-TW") : "－";

onMounted(() => { loadOptions(); loadOrders(); });
</script>

<template>
  <OutSideLayout>
    <PageTitle title="公司訂單" />
    <p class="orders-scope">顯示您所屬企業的訂單，包含其他人員下單的紀錄。</p>
    <el-form :model="filters" inline>
      <el-form-item label="訂單編號">
        <el-input v-model="filters.orderNo" clearable placeholder="請輸入訂單編號" @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="訂單狀態">
        <el-select v-model="filters.statusCode" clearable placeholder="全部" style="width: 150px">
          <el-option v-for="option in statusOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="search">查詢</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
    <SearchResultLayout>
      <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false">
        <el-button link type="primary" @click="loadOrders">重新載入</el-button>
      </el-alert>
      <el-table v-else :data="rows" v-loading="loading" stripe>
        <el-table-column prop="orderNo" label="訂單編號" min-width="190" />
        <el-table-column prop="memberName" label="下單人員" min-width="120" />
        <el-table-column prop="itemCount" label="商品項數" width="100" />
        <el-table-column label="訂單金額" width="140">
          <template #default="{ row }">NT$ {{ $price(row.totalAmount) }}</template>
        </el-table-column>
        <el-table-column label="訂單狀態" width="110">
          <template #default="{ row }">{{ statusLabels[row.orderStatusCode] || row.orderStatusCode }}</template>
        </el-table-column>
        <el-table-column label="下單時間" min-width="170">
          <template #default="{ row }">{{ formatDate(row.orderedAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="router.push(`/order/${row.orderID}`)">查看</el-button>
          </template>
        </el-table-column>
        <template #empty><el-empty description="目前沒有符合條件的公司訂單" /></template>
      </el-table>
      <div v-if="!loadError && totalCount > pageSize" class="orders-pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="totalCount"
          :disabled="loading"
          layout="prev, pager, next, total"
          @current-change="loadOrders"
        />
      </div>
    </SearchResultLayout>
  </OutSideLayout>
</template>

<style lang="scss" scoped>
.orders-scope { margin: 0 0 16px; color: #667085; }
.orders-pagination { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
