<script setup>
import { MemberDataChangeAPI } from "@/api/memberDataChange";
import { changeStatuses, changeStatus, changeDate, changeError } from "@/utils/memberDataChange";

const router = useRouter();
const loading = ref(false);
const loadError = ref("");
const data = reactive({ list: [], pager: { pageIndex: 1, pageSize: 10, totalCount: 0 } });
const filter = reactive({ status: "", pageIndex: 1 });
let requestId = 0;

const initList = async () => {
  const currentRequest = ++requestId;
  loading.value = true;
  loadError.value = "";
  try {
    const response = await MemberDataChangeAPI.GetList({ pageIndex: filter.pageIndex, pageSize: 10, status: filter.status || null });
    if (currentRequest !== requestId) return;
    if (!response.data.success) throw new Error("Invalid response");
    data.list = Array.isArray(response.data.data) ? response.data.data : [];
    Object.assign(data.pager, response.data.pagerInfo);
  } catch (error) {
    if (currentRequest !== requestId) return;
    console.log("get member data changes error", error);
    data.list = [];
    loadError.value = changeError(error, "申請紀錄載入失敗，請稍後再試");
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
};
const handleFilter = () => { filter.pageIndex = 1; initList(); };
const handlePageChange = (page) => { filter.pageIndex = page; initList(); };
onMounted(initList);
</script>

<template>
  <main class="change-container">
    <header class="change-header">
      <div><div class="change-eyebrow">會員服務</div><h1>會員資料變更申請</h1><p>查看所屬公司的過往申請紀錄，或提出新的資料變更申請。</p></div>
      <el-button type="primary" size="large" @click="router.push({ name: 'MemberDataChangeCreate' })">提出資料變更申請</el-button>
    </header>
    <section class="change-card">
      <div class="change-filter">
        <label for="change-status">審核狀態</label>
        <el-select id="change-status" v-model="filter.status" placeholder="全部" style="width:160px" @change="handleFilter">
          <el-option label="全部" value="" /><el-option v-for="(item, code) in changeStatuses" :key="code" :label="item.label" :value="code" />
        </el-select>
        <el-button :loading="loading" @click="initList">重新整理</el-button>
      </div>
      <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" class="change-notice" />
      <el-table v-if="!loadError" v-loading="loading" :data="data.list" stripe empty-text="目前沒有符合條件的申請紀錄">
        <el-table-column label="申請時間" min-width="165"><template #default="{ row }">{{ changeDate(row.createdAt) }}</template></el-table-column>
        <el-table-column label="附件" width="90"><template #default="{ row }"><el-tag :type="row.hasFile ? 'success' : 'info'">{{ row.hasFile ? '已上傳' : '未上傳' }}</el-tag></template></el-table-column>
        <el-table-column prop="submitterName" label="申請人" min-width="100" />
        <el-table-column prop="afterCompanyName" label="申請公司名稱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="changeReason" label="異動原因" min-width="180" show-overflow-tooltip />
        <el-table-column label="審核狀態" width="100"><template #default="{ row }"><el-tag :type="changeStatus(row.status).type">{{ changeStatus(row.status).label }}</el-tag></template></el-table-column>
        <el-table-column label="處理狀態" width="100"><template #default="{ row }">{{ row.isProcessed ? '已處理' : '未處理' }}</template></el-table-column>
        <el-table-column label="操作" fixed="right" width="90"><template #default="{ row }"><el-button size="small" @click="router.push({ name: 'MemberDataChangeDetail', params: { id: row.id } })">檢視</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-if="!loadError && data.pager.totalCount > data.pager.pageSize" class="change-pagination" background layout="prev, pager, next" :disabled="loading" :current-page="data.pager.pageIndex" :page-size="data.pager.pageSize" :total="data.pager.totalCount" @current-change="handlePageChange" />
    </section>
  </main>
</template>
