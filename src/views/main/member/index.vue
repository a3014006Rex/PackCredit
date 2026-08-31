<script setup>
import { Member } from "@/api/member";

const router = useRouter();
const loading = ref(false);

const form = reactive({
  companyName: "",
  contactName: "",
  email: "",
  status: null,
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
      companyName: form.companyName?.trim() || null,
      contactName: form.contactName?.trim() || null,
      email: form.email?.trim() || null,
    };
    const res = await Member.List(queryData);
    data.list = res.data.data;
    data.pagination = res.data.pagination;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleReset = () => {
  Object.assign(form, {
    companyName: "",
    contactName: "",
    email: "",
    status: null,
    pageRequestParameter: { isReturnAllDataAndNoPage: false, targetPage: 1, showCount: 10 },
  });
  initList();
};

const handlePageChange = (page) => {
  form.pageRequestParameter.targetPage = page;
  initList();
};

const getStatusClass = (status) => {
  const map = { "正常": "green", "停用": "secondary", "黑名單": "red" };
  return map[status] || "";
};

onMounted(() => {
  initList();
});
</script>

<template>
  <OutSideLayout>
    <template #search>
      <PageTitle>會員管理</PageTitle>
      <el-form :model="form" inline>
        <el-form-item label="企業名稱">
          <el-input v-model="form.companyName" placeholder="請輸入企業名稱" clearable />
        </el-form-item>
        <el-form-item label="聯絡人">
          <el-input v-model="form.contactName" placeholder="請輸入聯絡人姓名" clearable />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="form.email" placeholder="請輸入 Email" clearable />
        </el-form-item>
        <el-form-item label="狀態">
          <SelectMemberStatus v-model="form.status" />
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
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="companyName" label="企業名稱" min-width="180" />
          <el-table-column prop="taxId" label="統一編號" width="120" />
          <el-table-column prop="contactName" label="聯絡人" width="120" />
          <el-table-column prop="email" label="Email" min-width="180" />
          <el-table-column prop="phone" label="電話" width="130" />
          <el-table-column label="狀態" width="100">
            <template #default="{ row }">
              <span :class="getStatusClass(row.status)">{{ row.status }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="registerDate" label="註冊時間" width="180" />
          <el-table-column label="操作" fixed="right" width="100">
            <template #default="{ row }">
              <el-button
                size="small"
                v-if="$auth('會員管理', 'view')"
                @click="router.push(`/member/${row.id}`)"
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
