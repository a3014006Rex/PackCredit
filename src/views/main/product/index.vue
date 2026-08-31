<script setup>
import { Product } from "@/api/product";

const router = useRouter();
const loading = ref(false);

const form = reactive({
  name: "",
  categoryId: null,
  isActive: null,
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
      name: form.name?.trim() || null,
    };
    const res = await Product.List(queryData);
    data.list = res.data.data;
    data.pagination = res.data.pagination;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleReset = () => {
  Object.assign(form, {
    name: "",
    categoryId: null,
    isActive: null,
    pageRequestParameter: { isReturnAllDataAndNoPage: false, targetPage: 1, showCount: 10 },
  });
  initList();
};

const handlePageChange = (page) => {
  form.pageRequestParameter.targetPage = page;
  initList();
};

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`確定刪除商品「${row.name}」嗎？`, "系統提示", {
    confirmButtonText: "確認",
    cancelButtonText: "取消",
    type: "warning",
  });
  try {
    await Product.Delete(row.id);
    ElMessage({ message: "刪除成功", type: "success" });
    initList();
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  initList();
});
</script>

<template>
  <OutSideLayout>
    <template #search>
      <PageTitle>商品管理</PageTitle>
      <el-form :model="form" inline>
        <el-form-item label="商品名稱">
          <el-input v-model="form.name" placeholder="請輸入商品名稱" clearable />
        </el-form-item>
        <el-form-item label="商品分類">
          <SelectProductCategory v-model="form.categoryId" />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="form.isActive" placeholder="全部" clearable style="width: 120px">
            <el-option label="上架" :value="true" />
            <el-option label="下架" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="initList" :loading="loading">查詢</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <template #result>
      <SearchResultLayout>
        <template #action>
          <el-button
            type="primary"
            v-if="$auth('商品管理', 'creat')"
            @click="router.push('/product/create')"
          >新增商品</el-button>
        </template>

        <el-table :data="data.list" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="商品名稱" min-width="180" />
          <el-table-column prop="categoryName" label="分類" width="120" />
          <el-table-column label="售價" width="120">
            <template #default="{ row }">
              {{ $price(row.price) }}
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="庫存" width="100" />
          <el-table-column label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isActive ? 'success' : 'info'">
                {{ row.isActive ? "上架" : "下架" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createDate" label="建立時間" width="180" />
          <el-table-column label="操作" fixed="right" width="150">
            <template #default="{ row }">
              <el-button
                size="small"
                v-if="$auth('商品管理', 'view')"
                @click="router.push(`/product/${row.id}`)"
              >編輯</el-button>
              <el-button
                size="small"
                type="danger"
                v-if="$auth('商品管理', 'delete')"
                @click="handleDelete(row)"
              >刪除</el-button>
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
