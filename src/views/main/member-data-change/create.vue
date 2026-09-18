<script setup>
import { genFileId } from "element-plus";
import { AuthAPI } from "@/api/auth";
import { MemberDataChangeAPI } from "@/api/memberDataChange";
import { changeSections, changeFields, emptyChangeForm, changeError } from "@/utils/memberDataChange";
import { companyDocumentAccept, validateCompanyDocument } from "@/utils/companyDocument";

const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const loadError = ref("");
const submitError = ref("");
const formRef = ref();
const uploadRef = ref();
const memberDataChangeFile = ref(null);
const form = reactive(emptyChangeForm());
const current = reactive({ company: {}, account: {} });
const rules = Object.fromEntries(changeFields.map(field => [field.key, [
  ...(field.required ? [{ required: true, whitespace: true, message: `請填寫${field.label}`, trigger: "blur" }] : []),
  { max: field.max, message: `${field.label}不可超過 ${field.max} 個字元`, trigger: "blur" },
]]));
rules.afterTaxId.push({ pattern: /^[0-9]{8}$/, message: "統一編號須為 8 位數字", trigger: "blur" });
rules.afterEmail.push({ type: "email", message: "請填寫有效的電子信箱", trigger: "blur" });
rules.changeReason = [{ required: true, whitespace: true, message: "請填寫異動原因", trigger: "blur" }, { max: 2000, message: "異動原因不可超過 2000 個字元", trigger: "blur" }];

const handleFileChange = (uploadFile) => {
  const message = validateCompanyDocument(uploadFile.raw);
  if (message) {
    ElMessage.error(message);
    memberDataChangeFile.value = null;
    nextTick(() => uploadRef.value?.clearFiles());
    return;
  }
  memberDataChangeFile.value = uploadFile.raw;
};
const handleFileRemove = () => { memberDataChangeFile.value = null; };
const handleFileExceed = (files) => {
  const file = files?.[0];
  if (!file) return;
  uploadRef.value?.clearFiles();
  file.uid = genFileId();
  uploadRef.value?.handleStart(file);
};

const initProfile = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const response = await AuthAPI.GetMemberProfile();
    if (!response.data.success || !response.data.data) throw new Error("Invalid profile");
    Object.assign(current.company, response.data.data.company || {});
    Object.assign(current.account, response.data.data.account || {});
    Object.assign(form, emptyChangeForm(), {
      afterCompanyName: current.company.companyName || "",
      afterTaxId: current.company.taxId || "",
      afterAddress: current.company.fullAddress || "",
      afterPhone: current.company.companyPhone || "",
      afterFax: current.company.fax || "",
      afterEmail: current.company.invoiceEmail || "",
    });
  } catch (error) {
    console.log("get profile for change request error", error);
    loadError.value = changeError(error, "目前公司資料載入失敗，請重試");
  } finally { loading.value = false; }
};
const handleSubmit = async () => {
  if (submitting.value || loading.value || loadError.value) return;
  submitting.value = true;
  submitError.value = "";
  try {
    const valid = await formRef.value?.validate().catch(() => false);
    if (!valid) return;
    const payload = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value?.trim() || null]));
    const response = await MemberDataChangeAPI.Create(payload, memberDataChangeFile.value);
    if (!response.data.success || !response.data.data?.id) throw new Error("Invalid create response");
    ElMessage.success(response.data.message || "資料變更申請已送出");
    await router.replace({ name: "MemberDataChangeDetail", params: { id: response.data.data.id } });
  } catch (error) {
    console.log("submit member data change error", error);
    submitError.value = changeError(error, "申請送出失敗，請確認內容後再試");
  } finally { submitting.value = false; }
};
onMounted(initProfile);
</script>

<template>
  <main v-loading="loading" class="change-container">
    <header class="change-header">
      <div><div class="change-eyebrow">會員服務</div><h1>提出資料變更申請</h1><p>請填寫希望變更後的資料與原因，送出後可於申請紀錄查詢處理狀態。</p></div>
      <el-button :disabled="submitting" @click="router.push({ name: 'MemberDataChanges' })">返回申請紀錄</el-button>
    </header>
    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false"><template #default><el-button @click="initProfile">重新載入</el-button></template></el-alert>
    <template v-else-if="!loading">
      <section class="change-card">
        <h2>目前公司資料</h2>
        <dl class="change-data">
          <div><dt>公司名稱</dt><dd>{{ current.company.companyName || '－' }}</dd></div>
          <div><dt>客戶編號</dt><dd>{{ current.company.customerNo || '－' }}</dd></div>
          <div class="change-wide"><dt>聯絡地址</dt><dd>{{ current.company.fullAddress || '－' }}</dd></div>
          <div><dt>公司電話</dt><dd>{{ current.company.companyPhone || '－' }}</dd></div><div><dt>傳真</dt><dd>{{ current.company.fax || '－' }}</dd></div>
        </dl>
      </section>
      <el-alert title="審核通過後會更新企業資料。選填欄位留空將保留原資料；聯絡地址請填寫完整縣市、鄉鎮市區及路街門牌。" type="info" show-icon :closable="false" class="change-notice" />
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" :disabled="submitting" @submit.prevent="handleSubmit">
        <section v-for="section in changeSections" :key="section.title" class="change-card">
          <h2>{{ section.title }}</h2>
          <div class="change-grid">
            <el-form-item v-for="field in section.fields" :key="field.key" :label="field.label" :prop="field.key" :class="{ 'change-wide': field.wide }">
              <el-input v-model.trim="form[field.key]" :maxlength="field.max" :placeholder="field.required ? '請填寫' + field.label : '選填'" />
            </el-form-item>
          </div>
        </section>
        <section class="change-card">
          <h2>異動原因</h2>
          <el-form-item label="請說明此次申請變更的項目與原因" prop="changeReason"><el-input v-model.trim="form.changeReason" type="textarea" :rows="4" maxlength="2000" show-word-limit /></el-form-item>
          <el-form-item label="申請附件">
            <div class="change-upload">
              <el-upload ref="uploadRef" action="#" :auto-upload="false" :limit="1" :accept="companyDocumentAccept" :on-change="handleFileChange" :on-remove="handleFileRemove" :on-exceed="handleFileExceed">
                <el-button type="primary" plain>選擇檔案</el-button>
              </el-upload>
              <p>選填，限 PDF、Word、Excel、JPG、PNG，檔案上限 10 MB</p>
            </div>
          </el-form-item>
          <el-alert v-if="submitError" :title="submitError" type="error" show-icon :closable="false" />
          <div class="change-actions">
            <el-button :disabled="submitting" @click="router.push({ name: 'MemberDataChanges' })">取消</el-button>
            <el-button type="primary" native-type="submit" :loading="submitting">送出申請</el-button>
          </div>
        </section>
      </el-form>
    </template>
  </main>
</template>
