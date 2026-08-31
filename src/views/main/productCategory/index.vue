<script setup>
import { ProductCategory } from "@/api/productCategory";

const router = useRouter();
const loading = ref(false);

const form = reactive({
  name: "",
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
    const res = await ProductCategory.List(queryData);
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
    pageRequestParameter: { isReturnAllDataAndNoPage: false, targetPage: 1, showCount: 10 },
  });
  initList();
};

const handlePageChange = (page) => {
  form.pageRequestParameter.targetPage = page;
  initList();
};

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`確定刪除「${row.name}」嗎？`, "系統提示", {
    confirmButtonText: "確認",
    cancelButtonText: "取消",
    type: "warning",
  });
  try {
    await ProductCategory.Delete(row.id);
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
      <PageTitle>商品分類管理</PageTitle>
      <el-form :model="form" inline>
        <el-form-item label="分類名稱">
          <el-input v-model="form.name" placeholder="請輸入分類名稱" clearable />
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
            v-if="$auth('商品分類管理', 'creat')"
            @click="router.push('/productCategory/create')"
          >新增分類</el-button>
        </template>

        <el-table :data="data.list" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="分類名稱" />
          <el-table-column prop="sort" label="排序" width="100" />
          <el-table-column prop="isActive" label="狀態" width="100">
            <template #default="{ row }">
              <el-tag :type="row.isActive ? 'success' : 'info'">
                {{ row.isActive ? "啟用" : "停用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createDate" label="建立時間" width="180" />
          <el-table-column label="操作" fixed="right" width="150">
            <template #default="{ row }">
              <el-button
                size="small"
                v-if="$auth('商品分類管理', 'view')"
                @click="router.push(`/productCategory/${row.id}`)"
              >編輯</el-button>
              <el-button
                size="small"
                type="danger"
                v-if="$auth('商品分類管理', 'delete')"
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
