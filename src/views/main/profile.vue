<script setup>
import dayjs from "dayjs";
import { AuthAPI } from "@/api/auth";
import {
  companyDocumentAccept,
  formatFileSize,
  saveDownloadResponse,
  validateCompanyDocument,
} from "@/utils/companyDocument";

const router = useRouter();

const loading = ref(false);
const loadError = ref("");
const registerFileInput = ref();
const registerFile = ref(null);
const replacingRegisterFile = ref(false);
const profile = reactive({
  account: {},
  company: {},
  contacts: [],
  parameters: {},
});

const currentContact = computed(() =>
  profile.contacts.find((contact) => contact.isCurrentUser) || null
);

const primaryContact = computed(() =>
  profile.contacts.find((contact) => contact.isPrimary) || null
);

const display = (value) => {
  if (value === null || value === undefined || value === "") return "－";
  return value;
};

const formatDate = (value) => {
  if (!value) return "－";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY/MM/DD") : "－";
};

const formatPhone = (telephone, extension) => {
  if (!telephone) return "－";
  return extension ? `${telephone} 分機 ${extension}` : telephone;
};

const parameterText = (group, value, fallback = "") => {
  if (!value) return fallback || "－";
  const options = Array.isArray(profile.parameters[group])
    ? profile.parameters[group]
    : [];
  const normalizedValue = String(value).toLowerCase();
  const matchedOption = options.find((option) =>
    [option.value, option.id, option.alias]
      .filter(Boolean)
      .some((candidate) => String(candidate).toLowerCase() === normalizedValue)
  );
  return matchedOption?.text || fallback || value;
};

const permissionLabels = (target) => [
  target?.canPlaceOrder && "建立訂單",
  target?.canApproveOrder && "訂單核准",
  target?.canViewBalance && "查看餘額",
  target?.canViewInvoice && "查看發票",
  target?.canManageCompany && "公司管理",
].filter(Boolean);

const selectRegisterFile = (event) => {
  const file = event.target.files?.[0] || null;
  const message = validateCompanyDocument(file);
  if (message) {
    ElMessage.error(message);
    registerFile.value = null;
    event.target.value = "";
    return;
  }
  registerFile.value = file;
};

const replaceRegisterFile = async () => {
  if (!registerFile.value) {
    ElMessage.warning("請選擇要上傳的附件");
    return;
  }
  replacingRegisterFile.value = true;
  try {
    const response = await AuthAPI.ReplaceRegisterFile(registerFile.value);
    ElMessage.success(response.data.message || "註冊附件已更換");
    registerFile.value = null;
    if (registerFileInput.value) registerFileInput.value.value = "";
    await loadProfile();
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "註冊附件更換失敗");
  } finally {
    replacingRegisterFile.value = false;
  }
};

const downloadRegisterFile = async (file) => {
  try {
    const response = await AuthAPI.DownloadRegisterFile(file.fileId);
    saveDownloadResponse(response, file.fileName);
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "註冊附件下載失敗");
  }
};

const loadProfile = async () => {
  loading.value = true;
  loadError.value = "";
  try {
    const response = await AuthAPI.GetMemberProfile();
    if (!response.data.success || !response.data.data) {
      loadError.value = response.data.message || "無法取得個人及企業資料";
      return;
    }

    Object.assign(profile.account, response.data.data.account || {});
    Object.assign(profile.company, response.data.data.company || {});
    profile.contacts = Array.isArray(response.data.data.contacts)
      ? response.data.data.contacts
      : [];
    profile.parameters = response.data.data.parameters || {};
  } catch (error) {
    loadError.value = error.response?.data?.message || "無法取得個人及企業資料";
  } finally {
    loading.value = false;
  }
};

onMounted(loadProfile);
</script>

<template>
  <div class="profile-page">
    <section class="profile-header">
      <div class="profile-header__identity">
        <span class="profile-avatar"><i class="bx bxs-user"></i></span>
        <div>
          <div class="profile-eyebrow">會員中心</div>
          <h1>個人及企業資料</h1>
          <p>{{ display(profile.company.companyName) }}・{{ display(currentContact?.memberName || profile.account.userName) }}</p>
        </div>
      </div>
      <el-tag v-if="profile.company.memberStatusName" type="success" effect="light" size="large">
        {{ parameterText("memberStatuses", profile.company.memberStatusCode, profile.company.memberStatusName) }}
      </el-tag>
    </section>

    <main v-loading="loading" class="profile-content">
      <el-alert
        v-if="loadError"
        :title="loadError"
        type="error"
        show-icon
        :closable="false"
      >
        <template #default>
          <el-button type="primary" plain size="small" @click="loadProfile">重新載入</el-button>
        </template>
      </el-alert>

      <template v-else>
        <el-alert
          title="公司與帳號欄位為唯讀；如需修改請提出資料變更申請。待首次儲值期間可在下方更換註冊附件。"
          type="info"
          show-icon
          :closable="false"
          class="profile-notice"
        >
          <template #default>
            <el-button type="primary" link @click="router.push({ name: 'MemberDataChanges' })">查看申請紀錄</el-button>
            <el-button type="primary" link @click="router.push({ name: 'MemberDataChangeCreate' })">提出資料變更申請</el-button>
          </template>
        </el-alert>

        <section class="profile-card">
          <div class="section-title">
            <span class="section-icon"><i class="bx bx-user"></i></span>
            <div>
              <h2>個人資料</h2>
              <p>目前登入帳號及所對應的企業聯絡人資訊</p>
            </div>
          </div>

          <div class="data-grid">
            <div class="data-item"><span>登入帳號</span><strong>{{ display(profile.account.loginId) }}</strong></div>
            <div class="data-item"><span>姓名</span><strong>{{ display(currentContact?.memberName || profile.account.userName) }}</strong></div>
            <div class="data-item"><span>部門／職稱</span><strong>{{ display([currentContact?.departmentName || currentContact?.department || profile.account.departmentName || profile.account.department, currentContact?.jobTitle].filter(Boolean).join("／")) }}</strong></div>
            <div class="data-item"><span>電子信箱</span><strong>{{ display(currentContact?.email || profile.account.email) }}</strong></div>
            <div class="data-item"><span>行動電話</span><strong>{{ display(currentContact?.mobilePhone || profile.account.mobilePhone) }}</strong></div>
            <div class="data-item"><span>市內電話</span><strong>{{ formatPhone(currentContact?.telephone || profile.account.telephone, currentContact?.extension || profile.account.extension) }}</strong></div>
            <div class="data-item data-item--wide">
              <span>公司操作權限</span>
              <div class="permission-tags">
                <el-tag v-for="label in permissionLabels(profile.account)" :key="label" type="info" effect="plain" size="small">{{ label }}</el-tag>
                <strong v-if="!permissionLabels(profile.account).length">無</strong>
              </div>
            </div>
          </div>
        </section>

        <section class="profile-card">
          <div class="section-title">
            <span class="section-icon section-icon--company"><i class="bx bx-building-house"></i></span>
            <div>
              <h2>企業基本資料</h2>
              <p>公司登記、會員及聯絡資訊</p>
            </div>
          </div>

          <div class="data-grid">
            <div class="data-item data-item--wide"><span>企業名稱</span><strong>{{ display(profile.company.companyName) }}</strong></div>
            <div class="data-item"><span>統一編號</span><strong>{{ display(profile.company.taxId) }}</strong></div>
            <div class="data-item"><span>客戶編號</span><strong>{{ display(profile.company.customerNo) }}</strong></div>
            <div class="data-item"><span>會員等級</span><strong>{{ parameterText("memberLevels", profile.company.memberLevel, profile.company.memberLevelName) }}</strong></div>
            <div class="data-item"><span>產業類型</span><strong>{{ parameterText("industryTypes", profile.company.industryType, profile.company.industryTypeName) }}</strong></div>
            <div class="data-item"><span>公司電話</span><strong>{{ display(profile.company.companyPhone) }}</strong></div>
            <div class="data-item"><span>傳真</span><strong>{{ display(profile.company.fax) }}</strong></div>
            <div class="data-item data-item--wide"><span>公司地址</span><strong>{{ display(profile.company.fullAddress) }}</strong></div>
            <div class="data-item data-item--wide"><span>帳單地址</span><strong>{{ display(profile.company.billingAddress) }}</strong></div>
            <div class="data-item data-item--wide"><span>送貨地址</span><strong>{{ display(profile.company.shippingAddress) }}</strong></div>
            <div class="data-item"><span>取貨方式</span><strong>{{ parameterText("deliveryMethods", profile.company.deliveryMethod, profile.company.deliveryMethodName) }}</strong></div>
            <div class="data-item"><span>發票形式</span><strong>{{ parameterText("invoiceTypes", profile.company.invoiceType, profile.company.invoiceTypeName) }}</strong></div>
            <div class="data-item"><span>電子發票信箱</span><strong>{{ display(profile.company.invoiceEmail) }}</strong></div>
            <div class="data-item"><span>結帳日／付款條件</span><strong>{{ display([profile.company.checkoutDate, parameterText("paymentMethods", profile.company.paymentTerm, profile.company.paymentTermName)].filter((value) => value && value !== "－").join("／")) }}</strong></div>
            <div class="data-item"><span>註冊日期</span><strong>{{ formatDate(profile.company.registrationDate) }}</strong></div>
            <div class="data-item"><span>主要聯絡人</span><strong>{{ display(primaryContact?.memberName) }}</strong></div>
          </div>
          <div class="company-file">
            <div class="company-file__title">註冊附件</div>
            <div v-if="profile.company.registerFiles?.length" class="company-file__list">
              <div v-for="file in profile.company.registerFiles" :key="file.fileId" class="company-file__item">
                <div>
                  <strong>{{ file.fileName }}</strong>
                  <small>{{ formatFileSize(file.fileSize) }}・{{ formatDate(file.uploadedAt) }}</small>
                </div>
                <el-button type="primary" link @click="downloadRegisterFile(file)">下載</el-button>
              </div>
            </div>
            <span v-else class="company-file__empty">未上傳</span>
            <div v-if="profile.company.canReplaceRegisterFile" class="company-file__replace">
              <input ref="registerFileInput" type="file" :accept="companyDocumentAccept" @change="selectRegisterFile" />
              <el-button type="primary" :loading="replacingRegisterFile" @click="replaceRegisterFile">
                上傳／更換附件
              </el-button>
              <small>公司完成首次儲值前可更換；更換後原附件會永久刪除。</small>
            </div>
          </div>
        </section>

        <section class="profile-card">
          <div class="section-title">
            <span class="section-icon section-icon--contacts"><i class="bx bx-group"></i></span>
            <div>
              <h2>企業聯絡人</h2>
              <p>共 {{ profile.contacts.length }} 位聯絡人資料</p>
            </div>
          </div>

          <div v-if="profile.contacts.length" class="contact-list">
            <article
              v-for="contact in profile.contacts"
              :key="contact.memberId"
              class="contact-card"
              :class="{ 'is-current': contact.isCurrentUser }"
            >
              <div class="contact-card__header">
                <div>
                  <h3>{{ contact.memberName }}</h3>
                  <p>{{ display([contact.departmentName || contact.department, contact.jobTitle].filter(Boolean).join("／")) }}</p>
                </div>
                <div class="contact-tags">
                  <el-tag v-if="contact.isCurrentUser" type="primary" size="small">目前登入者</el-tag>
                  <el-tag v-if="contact.isPrimary" type="success" size="small">主要聯絡人</el-tag>
                  <el-tag type="info" effect="plain" size="small">{{ parameterText("memberTypes", contact.memberType, contact.memberTypeName) }}</el-tag>
                </div>
              </div>
              <dl>
                <div><dt>電子信箱</dt><dd>{{ display(contact.email) }}</dd></div>
                <div><dt>行動電話</dt><dd>{{ display(contact.mobilePhone) }}</dd></div>
                <div><dt>市內電話</dt><dd>{{ formatPhone(contact.telephone, contact.extension) }}</dd></div>
                <div><dt>狀態</dt><dd>{{ parameterText("contactStatuses", contact.statusCode, contact.statusName) }}</dd></div>
              </dl>
              <div class="permission-tags contact-permissions">
                <el-tag v-for="label in permissionLabels(contact)" :key="label" type="info" effect="plain" size="small">{{ label }}</el-tag>
              </div>
            </article>
          </div>
          <el-empty v-else description="目前沒有可顯示的聯絡人資料" />
        </section>
      </template>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  min-height: 100%;
  padding: 32px;
  background:
    radial-gradient(circle at top right, rgba(27, 154, 170, .12), transparent 30%),
    #f5f7fa;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.profile-header__identity {
  display: flex;
  align-items: center;
  gap: 16px;

  h1 {
    margin: 3px 0 5px;
    color: $text-primary;
    font-size: 30px;
  }

  p { margin: 0; color: $text-light; }
}

.profile-avatar {
  width: 58px;
  height: 58px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 18px;
  background: linear-gradient(135deg, $primary, #37b8a7);
  color: #fff;
  box-shadow: 0 8px 18px rgba(7, 93, 186, .2);

  i { font-size: 32px; }
}

.profile-eyebrow {
  color: $primary;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .12em;
}

.profile-content {
  min-height: 320px;
  display: grid;
  gap: 18px;
}

.profile-notice { margin-bottom: 0; }

.profile-card {
  padding: 24px;
  border: 1px solid #e6ebf1;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(26, 82, 118, .06);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #edf1f5;

  h2 { margin: 0 0 4px; color: $text-primary; font-size: 19px; }
  p { margin: 0; color: $text-light; font-size: 13px; }
}

.section-icon {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 11px;
  background: rgba(7, 93, 186, .1);
  color: $primary;

  i { font-size: 22px; }
}

.section-icon--company { background: rgba(79, 159, 127, .12); color: #3d8769; }
.section-icon--contacts { background: rgba(233, 154, 42, .12); color: #b86f16; }

.data-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid #e8edf2;
  border-radius: 10px;
  background: #e8edf2;
}

.data-item {
  min-width: 0;
  min-height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 7px;
  padding: 14px 16px;
  background: #fff;

  span { color: $text-light; font-size: 12px; }
  strong { overflow-wrap: anywhere; color: $text-primary; font-size: 14px; font-weight: 600; }
}

.data-item--wide { grid-column: 1 / -1; }

.contact-list { display: grid; gap: 12px; }

.contact-card {
  padding: 18px;
  border: 1px solid #e6ebf1;
  border-radius: 11px;
  background: #fbfcfd;

  &.is-current {
    border-color: rgba(7, 93, 186, .3);
    background: rgba(7, 93, 186, .025);
  }
}

.contact-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h3 { margin: 0 0 4px; color: $text-primary; font-size: 16px; }
  p { margin: 0; color: $text-light; font-size: 13px; }
}

.contact-tags { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }

.contact-card dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;
  margin: 0;

  div { min-width: 0; }
  dt { margin-bottom: 4px; color: $text-light; font-size: 12px; }
  dd { margin: 0; overflow-wrap: anywhere; color: $text-primary; font-size: 14px; }
}

.permission-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.contact-permissions { margin-top: 12px; }
.company-file { margin-top: 22px; padding-top: 18px; border-top: 1px solid #edf0f4; }
.company-file__title { margin-bottom: 10px; color: #52606d; font-weight: 700; }
.company-file__list { display: grid; gap: 8px; }
.company-file__item,
.company-file__replace { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.company-file__item { justify-content: space-between; padding: 10px 12px; border-radius: 8px; background: #f7f9fb; }
.company-file__item div { display: grid; gap: 3px; }
.company-file__item small,
.company-file__replace small,
.company-file__empty { color: #7b8794; }
.company-file__replace { margin-top: 12px; }

@media (max-width: 640px) {
  .profile-page { padding: 22px 14px; }
  .profile-header { align-items: flex-start; }
  .profile-header__identity h1 { font-size: 25px; }
  .profile-avatar { width: 48px; height: 48px; border-radius: 14px; }
  .profile-card { padding: 18px 14px; }
  .data-grid,
  .contact-card dl { grid-template-columns: 1fr; }
  .data-item--wide { grid-column: auto; }
  .contact-card__header { flex-direction: column; }
  .contact-tags { justify-content: flex-start; }
}
</style>
