<script setup>
import { AuthAPI } from "@/api/auth";

const loading = ref(false);
const saving = ref(false);
const statusUpdatingId = ref(null);
const loadError = ref("");
const dialogVisible = ref(false);
const editingId = ref(null);
const createLoginAccount = ref(false);
const formRef = ref();
const members = ref([]);
const profile = reactive({ account: {}, company: {} });

const emptyForm = () => ({
  loginId: "", memberName: "", email: "", initialPassword: "", mobilePhone: "",
  telephone: "", extension: "", jobTitle: "",
  canPlaceOrder: false, canApproveOrder: false, canViewBalance: false,
  canViewInvoice: false, canManageCompany: false,
});
const form = reactive(emptyForm());
const isPending = computed(() => profile.company.memberStatusCode !== "Member_Status_NORMAL");
const needsLoginAccount = computed(() => !!editingId.value && !form.loginId);
const showCredentials = computed(() => !editingId.value || (needsLoginAccount.value && createLoginAccount.value));

const rules = {
  memberName: [{ required: true, message: "請輸入聯絡人姓名", trigger: "blur" }],
  email: [{ required: true, type: "email", message: "請輸入有效 Email", trigger: "blur" }],
  initialPassword: [
    { required: true, message: "請設定初始密碼", trigger: "blur" },
    { min: 6, max: 50, message: "初始密碼需為 6 至 50 個字元", trigger: "blur" },
  ],
};

const showRequestError = (error, fallback) => {
  // 共用 API 攔截器已顯示這些狀態，避免重複提示；409 與 404 在此顯示具體原因。
  if ([400, 401, 403, 500, 503].includes(error?.response?.status)) return;
  ElMessage.error(error?.response?.data?.message || fallback);
};

const normalizeMember = (item) => ({
  memberId: item.memberID ?? item.MemberID,
  loginId: item.loginID ?? item.LoginID,
  memberName: item.memberName ?? item.MemberName,
  email: item.email ?? item.Email,
  mobilePhone: item.mobilePhone ?? item.MobilePhone,
  telephone: item.telephone ?? item.Telephone,
  extension: item.extension ?? item.Extension,
  department: item.department ?? item.Department,
  departmentName: item.departmentName ?? item.DepartmentName,
  jobTitle: item.jobTitle ?? item.JobTitle,
  isActive: item.isActive ?? item.IsActive,
  isPrimary: item.isPrimary ?? item.IsPrimary,
  isCurrentUser: item.isCurrentUser ?? item.IsCurrentUser,
  canPlaceOrder: item.canPlaceOrder ?? item.CanPlaceOrder,
  canApproveOrder: item.canApproveOrder ?? item.CanApproveOrder,
  canViewBalance: item.canViewBalance ?? item.CanViewBalance,
  canViewInvoice: item.canViewInvoice ?? item.CanViewInvoice,
  canManageCompany: item.canManageCompany ?? item.CanManageCompany,
});

const loadData = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const [profileResponse, membersResponse] = await Promise.all([
      AuthAPI.GetMemberProfile(), AuthAPI.GetCompanyMembers(),
    ]);
    const profileData = profileResponse.data?.data || {};
    Object.assign(profile.account, profileData.account || {});
    Object.assign(profile.company, profileData.company || {});
    const list = membersResponse.data?.data;
    members.value = Array.isArray(list) ? list.map(normalizeMember) : [];
  } catch (error) {
    loadError.value = error.response?.data?.message || "無法取得公司聯絡人帳號";
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editingId.value = null;
  createLoginAccount.value = false;
  Object.assign(form, emptyForm());
  dialogVisible.value = true;
};

const openEdit = (member, activateAccount = false) => {
  editingId.value = member.memberId;
  createLoginAccount.value = activateAccount && !member.loginId;
  Object.assign(form, emptyForm(), member, { initialPassword: "" });
  dialogVisible.value = true;
};

const save = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  saving.value = true;
  try {
    const payload = {
      memberName: form.memberName.trim(), mobilePhone: form.mobilePhone || null,
      telephone: form.telephone || null, extension: form.extension || null,
      jobTitle: form.jobTitle || null,
      canPlaceOrder: form.canPlaceOrder, canApproveOrder: form.canApproveOrder,
      canViewBalance: form.canViewBalance, canViewInvoice: form.canViewInvoice,
      canManageCompany: form.canManageCompany,
    };
    const response = editingId.value
      ? await AuthAPI.UpdateCompanyMember(editingId.value, {
          ...payload,
          ...(createLoginAccount.value ? {
            createLoginAccount: true,
            email: String(form.email || "").trim(),
            initialPassword: form.initialPassword,
          } : {}),
        })
      : await AuthAPI.CreateCompanyMember({
          ...payload, email: String(form.email || "").trim(), initialPassword: form.initialPassword,
        });
    ElMessage.success(response.data?.message || "儲存成功");
    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    showRequestError(error, "儲存聯絡人資料失敗，請稍後再試");
  } finally {
    saving.value = false;
  }
};

const setStatus = async (member, isActive) => {
  if (isActive && !member.loginId) {
    openEdit(member, true);
    return;
  }
  try {
    await ElMessageBox.confirm(
      `確認要${isActive ? "啟用" : "停用"}「${member.memberName}」的登入帳號嗎？`,
      "公司帳號管理", { type: "warning" }
    );
    statusUpdatingId.value = member.memberId;
    const response = await AuthAPI.SetCompanyMemberStatus(member.memberId, isActive);
    ElMessage.success(response.data?.message || "狀態已更新");
    await loadData();
  } catch (error) {
    if (error !== "cancel" && error !== "close") {
      showRequestError(error, "更新帳號狀態失敗，請稍後再試");
    }
  } finally {
    statusUpdatingId.value = null;
  }
};

const permissionLabels = (member) => [
  member.canPlaceOrder && "下單", member.canApproveOrder && "訂單核准",
  member.canViewBalance && "查看餘額", member.canViewInvoice && "查看發票",
  member.canManageCompany && "公司管理",
].filter(Boolean);

onMounted(loadData);
</script>

<template>
  <div class="member-admin-page">
    <section class="page-header">
      <div><div class="eyebrow">企業管理</div><h1>公司聯絡人帳號</h1><p>公司管理者可建立聯絡人；新增的登入帳號使用 Email。</p></div>
      <el-button type="primary" size="large" :disabled="isPending || !!loadError" @click="openCreate"><i class="bx bx-user-plus"></i>新增聯絡人</el-button>
    </section>
    <main v-loading="loading" class="page-content">
      <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false"><el-button type="primary" link @click="loadData">重新載入</el-button></el-alert>
      <el-alert v-if="!loadError && isPending" title="公司尚未開通" description="請先完成首次儲值並由後台確認入帳，之後才可建立或異動聯絡人帳號。" type="warning" show-icon :closable="false" />
      <section v-if="!loadError" class="content-card">
        <el-table :data="members" stripe>
          <el-table-column label="聯絡人" min-width="170">
            <template #default="{ row }"><strong>{{ row.memberName }}</strong><div class="muted">{{ [row.departmentName || row.department, row.jobTitle].filter(Boolean).join('／') || '－' }}</div><el-tag v-if="row.isPrimary" size="small" type="success">主要管理者</el-tag><el-tag v-if="row.isCurrentUser" size="small">目前登入者</el-tag></template>
          </el-table-column>
          <el-table-column label="登入帳號" min-width="210"><template #default="{ row }">{{ row.loginId || '－' }}</template></el-table-column>
          <el-table-column label="電話" min-width="150"><template #default="{ row }">{{ row.mobilePhone || row.telephone || '－' }}</template></el-table-column>
          <el-table-column label="權限" min-width="260"><template #default="{ row }"><el-tag v-for="label in permissionLabels(row)" :key="label" size="small" type="info" effect="plain">{{ label }}</el-tag><span v-if="!permissionLabels(row).length">－</span></template></el-table-column>
          <el-table-column label="狀態" width="110"><template #default="{ row }"><el-tag :type="!row.loginId ? 'info' : row.isActive ? 'success' : 'danger'">{{ !row.loginId ? '未建立帳號' : row.isActive ? '啟用' : '停用' }}</el-tag></template></el-table-column>
          <el-table-column label="操作" width="230" fixed="right"><template #default="{ row }"><el-button size="small" :disabled="isPending" @click="openEdit(row)">編輯</el-button><el-button v-if="!row.isPrimary && !row.isCurrentUser" size="small" :type="row.isActive ? 'danger' : 'success'" plain :loading="statusUpdatingId === row.memberId" :disabled="isPending" @click="setStatus(row, !row.isActive)">{{ !row.loginId ? '建立並啟用' : row.isActive ? '停用' : '啟用' }}</el-button></template></el-table-column>
        </el-table>
      </section>
    </main>

    <el-dialog v-model="dialogVisible" :title="editingId ? '編輯聯絡人資料與帳號' : '新增聯絡人帳號'" width="min(680px, 94vw)" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <div class="form-grid">
          <el-form-item label="聯絡人姓名" prop="memberName"><el-input v-model.trim="form.memberName" maxlength="100" /></el-form-item>
          <el-form-item label="行動電話"><el-input v-model.trim="form.mobilePhone" maxlength="50" /></el-form-item>
          <el-form-item label="市內電話"><el-input v-model.trim="form.telephone" maxlength="50" /></el-form-item>
          <el-form-item label="分機"><el-input v-model.trim="form.extension" maxlength="20" /></el-form-item>
          <el-form-item label="職稱"><el-input v-model.trim="form.jobTitle" maxlength="100" /></el-form-item>
        </div>
        <el-divider content-position="left">登入帳號</el-divider>
        <el-form-item v-if="editingId && !createLoginAccount" label="登入帳號">
          <el-input :model-value="form.loginId || '尚未設定'" disabled />
          <div v-if="form.loginId" class="muted">已建立的登入帳號不可在此變更。</div>
        </el-form-item>
        <template v-if="needsLoginAccount">
          <el-alert title="此聯絡人尚未建立登入帳號" description="可保留為純聯絡人；如需登入，請設定 Email 與初始密碼，儲存後將立即啟用。" type="info" show-icon :closable="false" />
          <el-checkbox v-model="createLoginAccount" class="account-checkbox">建立並啟用登入帳號</el-checkbox>
        </template>
        <div v-if="showCredentials" class="form-grid">
          <el-form-item label="Email／登入帳號" prop="email"><el-input v-model.trim="form.email" maxlength="100" /></el-form-item>
          <el-form-item label="初始密碼" prop="initialPassword"><el-input v-model="form.initialPassword" type="password" show-password maxlength="50" /></el-form-item>
        </div>
        <el-divider content-position="left">公司權限</el-divider>
        <div class="permission-grid">
          <el-checkbox v-model="form.canPlaceOrder">建立及送出訂單</el-checkbox><el-checkbox v-model="form.canApproveOrder">核准公司訂單</el-checkbox><el-checkbox v-model="form.canViewBalance">查看儲值餘額</el-checkbox><el-checkbox v-model="form.canViewInvoice">查看及下載發票</el-checkbox><el-checkbox v-model="form.canManageCompany">管理公司及聯絡人</el-checkbox>
        </div>
      </el-form>
      <template #footer><el-button :disabled="saving" @click="dialogVisible = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">儲存</el-button></template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.member-admin-page { min-height: 100%; padding: 32px; background: radial-gradient(circle at top right, rgba(27,154,170,.12), transparent 30%), #f5f7fa; }
.page-header { display:flex; align-items:flex-end; justify-content:space-between; gap:20px; margin-bottom:22px; h1{margin:4px 0 6px;font-size:30px;color:$text-primary} p{margin:0;color:$text-light} .el-button i{margin-right:6px;font-size:18px} }
.eyebrow { color:$primary; font-size:13px; font-weight:700; letter-spacing:.12em; }
.page-content { display:grid; gap:16px; }
.content-card { overflow:hidden; padding:18px; border:1px solid #e6ebf1; border-radius:14px; background:#fff; box-shadow:0 6px 18px rgba(26,82,118,.06); }
.muted { margin:3px 0 5px; color:$text-light; font-size:12px; }
.el-tag + .el-tag { margin-left:5px; }
.form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 16px; }
.permission-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.account-checkbox { margin-top:12px; }
@media(max-width:700px){.member-admin-page{padding:22px 14px}.page-header{align-items:flex-start;flex-direction:column}.form-grid,.permission-grid{grid-template-columns:1fr}}
</style>
