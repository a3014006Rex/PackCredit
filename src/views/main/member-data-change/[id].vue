<script setup>
import { MemberDataChangeAPI } from "@/api/memberDataChange";
import { changeSections, changeFields, changeStatus, changeDate, changeError } from "@/utils/memberDataChange";
import {
  companyDocumentAccept,
  formatFileSize,
  saveDownloadResponse,
  validateCompanyDocument,
} from "@/utils/companyDocument";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const loadError = ref("");
const record = ref(null);
const replacementInput = ref();
const replacementFile = ref(null);
const replacingFile = ref(false);
let requestId = 0;
const comparisons = changeFields.filter(field => field.before);
const otherSections = changeSections.map(section => ({ ...section, fields: section.fields.filter(field => !field.before) }));
const canReplaceFile = computed(() => record.value?.status === "PENDING" && !record.value?.isProcessed);
const initDetail = async () => {
  const currentRequest = ++requestId;
  loading.value = true;
  loadError.value = "";
  record.value = null;
  try {
    const response = await MemberDataChangeAPI.GetDetail(route.params.id);
    if (currentRequest !== requestId) return;
    if (!response.data.success || !response.data.data) throw new Error("Invalid response");
    record.value = response.data.data;
  } catch (error) {
    if (currentRequest !== requestId) return;
    console.log("get member data change detail error", error);
    loadError.value = changeError(error, "找不到申請紀錄或無法載入，請返回列表重試");
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
};
const downloadFile = async (file) => {
  try {
    const response = await MemberDataChangeAPI.DownloadFile(record.value.id, file.fileId);
    saveDownloadResponse(response, file.fileName);
  } catch (error) {
    console.log("download member data change file error", error);
    ElMessage.error(changeError(error, "附件下載失敗，請稍後再試"));
  }
};
const selectReplacementFile = (event) => {
  const file = event.target.files?.[0] || null;
  const message = validateCompanyDocument(file);
  if (message) {
    ElMessage.error(message);
    replacementFile.value = null;
    event.target.value = "";
    return;
  }
  replacementFile.value = file;
};
const replaceFile = async () => {
  if (!replacementFile.value) {
    ElMessage.warning("請選擇要上傳的附件");
    return;
  }
  replacingFile.value = true;
  try {
    const response = await MemberDataChangeAPI.ReplaceFile(record.value.id, replacementFile.value);
    if (!response.data.success || !response.data.data) throw new Error("Invalid replace response");
    record.value = response.data.data;
    replacementFile.value = null;
    if (replacementInput.value) replacementInput.value.value = "";
    ElMessage.success(response.data.message || "附件已更換");
  } catch (error) {
    ElMessage.error(changeError(error, "附件更換失敗，請稍後再試"));
  } finally {
    replacingFile.value = false;
  }
};
watch(() => route.params.id, initDetail, { immediate: true });
</script>

<template>
  <main v-loading="loading" class="change-container">
    <header class="change-header">
      <div><div class="change-eyebrow">會員服務</div><h1>資料變更申請明細</h1><p>檢視送出時的申請內容與目前處理狀態。</p></div>
      <el-button @click="router.push({ name: 'MemberDataChanges' })">返回申請紀錄</el-button>
    </header>
    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false"><template #default><el-button @click="initDetail">重新載入</el-button></template></el-alert>
    <template v-else-if="record">
      <section class="change-card">
        <div class="change-meta">
          <el-tag :type="changeStatus(record.status).type">{{ changeStatus(record.status).label }}</el-tag>
          <span>處理狀態：{{ record.isProcessed ? '已處理' : '未處理' }}</span>
          <span>申請人：{{ record.submitterName || '－' }}</span><span>填表日期：{{ changeDate(record.fillDate, true) }}</span>
          <span>送出時間：{{ changeDate(record.createdAt) }}</span><span>更新時間：{{ changeDate(record.updatedAt) }}</span>
          <span>客戶編號：{{ record.beforeCustomerId || '－' }}</span>
        </div>
        <h2>公司資料異動內容</h2>
        <table class="change-comparison">
          <thead><tr><th>項目</th><th>異動前</th><th>申請變更後</th></tr></thead>
          <tbody><tr v-for="field in comparisons" :key="field.key"><th>{{ field.label }}</th><td>{{ record[field.before] || '－' }}</td><td :class="{ 'is-changed': (record[field.before] || '') !== (record[field.key] || '') }">{{ record[field.key] || '－' }}</td></tr></tbody>
        </table>
      </section>
      <section v-for="section in otherSections" :key="section.title" class="change-card">
        <h2>{{ section.title.replace('（選填）', '') }}</h2>
        <dl class="change-data"><div v-for="field in section.fields" :key="field.key"><dt>{{ field.label }}</dt><dd>{{ record[field.key] || '－' }}</dd></div></dl>
      </section>
      <section class="change-card"><h2>異動原因</h2><p class="change-text">{{ record.changeReason || '－' }}</p></section>
      <section class="change-card">
        <h2>申請附件</h2>
        <div v-if="record.files?.length" class="change-files">
          <div v-for="file in record.files" :key="file.fileId" class="change-file">
            <span>{{ file.fileName }}</span>
            <small>{{ formatFileSize(file.fileSize) }}・{{ changeDate(file.uploadedAt) }}</small>
            <el-button type="primary" link @click="downloadFile(file)">下載</el-button>
          </div>
        </div>
        <span v-else>未上傳</span>
        <div v-if="canReplaceFile" class="change-file-replace">
          <input ref="replacementInput" type="file" :accept="companyDocumentAccept" @change="selectReplacementFile" />
          <el-button type="primary" :loading="replacingFile" @click="replaceFile">上傳／更換附件</el-button>
          <small>申請審核前可更換；更換後原附件會永久刪除。</small>
        </div>
      </section>
    </template>
  </main>
</template>
