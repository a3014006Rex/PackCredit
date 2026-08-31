<script setup>
import { Order } from "@/api/order";
import { useStatus } from "@/composables/useStatus";

const router = useRouter();
const loading = ref(false);

const form = reactive({
  orderNo: "",
  memberName: "",
  orderStatus: null,
  createDate: [],
  pageRequestParameter: {
    isReturnAllDataAndNoPage: false,
    targetPage: 1,
    showCount: 10,
  },
});

const data = reactive({
  list: [],
  pagination: null,
});

const initList = async () => {
  loading.value = true;
  try {
    const queryData = {
      ...form,
      orderNo: form.orderNo?.trim() || null,
      memberName: form.memberName?.trim() || null,
      createDate: form.createDate?.length ? form.createDate : null,
    };
    const res = await Order.List(queryData);
    data.list = res.data.data;
    data.pagination = res.data.pagination;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleReset = () => {
  Object.assign(form, {
    orderNo: "",
    memberName: "",
    orderStatus: null,
    createDate: [],
    pageRequestParameter: { isReturnAllDataAndNoPage: false, targetPage: 1, showCount: 10 },
  });
  initList();
};

const handlePageChange = (page) => {
  form.pageRequestParameter.targetPage = page;
  initList();
};

// 訂單狀態對應 CSS class
const getOrderStatusClass = (status) => {
  const map = {
    "待確認": "blue",
    "已確認": "blue",
    "備貨中": "blue",
    "已出貨": "green",
    "已完成": "green",
    "已取消": "secondary",
    "退貨處理中": "blue",
    "已退款": "secondary",
  };
  return map[status] || "";
};

onMounted(() => {
  initList();
});
</script>

<template>
  <OutSideLayout>
    <template #search>
      <PageTitle>訂單管理</PageTitle>
      <el-form :model="form" inline>
        <el-form-item label="訂單編號">
          <el-input v-model="form.orderNo" placeholder="請輸入訂單編號" clearable />
        </el-form-item>
        <el-form-item label="採購企業">
          <el-input v-model="form.memberName" placeholder="請輸入企業名稱" clearable />
        </el-form-item>
        <el-form-item label="訂單狀態">
          <SelectOrderStatus v-model="form.orderStatus" />
        </el-form-item>
        <el-form-item label="建立日期">
          <el-date-picker
            v-model="form.createDate"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="initList" :loading="loading">查詢</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <template #result>
      <SearchResultLayout>
        <el-table :data="data.list" v-loading="loading" stripe>
          <el-table-column prop="orderNo" label="訂單編號" min-width="160" />
          <el-table-column prop="memberName" label="採購企業" min-width="160" />
          <el-table-column label="訂單金額" width="130">
            <template #default="{ row }">
              {{ $price(row.totalAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="itemCount" label="商品項數" width="100" />
          <el-table-column label="訂單狀態" width="120">
            <template #default="{ row }">
              <span :class="getOrderStatusClass(row.orderStatus)">
                {{ row.orderStatus }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createDate" label="建立時間" width="180" />
          <el-table-column label="操作" fixed="right" width="100">
            <template #default="{ row }">
              <el-button
                size="small"
                v-if="$auth('訂單管理', 'view')"
                @click="router.push(`/order/${row.id}`)"
              >查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <template #pagination>
          <Pagination :pagination="data.pagination" @change="handlePageChange" />
        </template>
      </SearchResultLayout>
    </template>
  </OutSideLayout>
</template>

<style lang="scss" scoped></style>
