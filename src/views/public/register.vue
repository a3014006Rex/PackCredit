<script setup>
import { genFileId } from "element-plus";
import { AuthAPI } from "@/api/auth";
import { Register as rules } from "@/plugins/rules";
import { companyDocumentAccept, validateCompanyDocument } from "@/utils/companyDocument";

const router = useRouter();
const formRef = ref();
const uploadRef = ref();
const registerFile = ref(null);
const loading = ref(false);
const registrationComplete = ref(false);
const sameAsEmail = ref(false);
const registerParameterLoading = ref(false);
const registerParameterError = ref("");
const districtLoading = ref(false);
const districtError = ref("");
const memberLevels = ref([]);
const deliveryMethods = ref([]);
const businessCategories = ref([]);
const invoiceTypes = ref([]);
const cities = ref([]);
const districts = ref([]);
const memberRightsLoading = ref(false);
const memberRightsError = ref("");
const memberRights = ref(null);
const memberRightsVisible = ref(false);
const memberRightsRead = ref(false);
const memberRightsAccepted = ref(false);
const rightsScrolledToEnd = ref(false);
const rightsContentRef = ref();
let districtRequestID = 0;

const hasRequiredRegisterParameters = computed(() =>
  memberLevels.value.length > 0 &&
  deliveryMethods.value.length > 0 &&
  invoiceTypes.value.length > 0 &&
  cities.value.length > 0
);

const form = reactive({
  memberLevel: "",
  companyName: "",
  contactName: "",
  industryType: "",
  password: "",
  confirmPassword: "",
  taxID: "",
  contactPhone: "",
  fax: "",
  addressCity: "",
  addressDistrict: "",
  addressDetail: "",
  deliveryMethod: "",
  email: "",
  invoiceEmail: "",
  invoiceType: "",
});

const validateConfirmPassword = (_rule, value, callback) => {
  if (!value) { callback(new Error("請再次輸入密碼")); return; }
  if (value !== form.password) { callback(new Error("兩次輸入的密碼不一致")); return; }
  callback();
};

const localRules = {
  ...rules,
  confirmPassword: [{ validator: validateConfirmPassword, trigger: "blur" }],
};

const handleFileChange = (uploadFile) => {
  const message = validateCompanyDocument(uploadFile.raw);
  if (message) {
    ElMessage.error(message);
    registerFile.value = null;
    nextTick(() => uploadRef.value?.clearFiles());
    return;
  }
  registerFile.value = uploadFile.raw;
};
const handleFileRemove = () => { registerFile.value = null; };
const handleFileExceed = (files) => {
  const file = files?.[0];
  if (!file) return;
  uploadRef.value?.clearFiles();
  file.uid = genFileId();
  uploadRef.value?.handleStart(file);
};

watch(sameAsEmail, (val) => {
  if (val) form.invoiceEmail = form.email;
});
watch(() => form.email, (val) => {
  if (sameAsEmail.value) form.invoiceEmail = val;
});

watch(() => form.addressCity, async (cityCode) => {
  const requestID = ++districtRequestID;
  form.addressDistrict = "";
  districts.value = [];
  districtError.value = "";
  districtLoading.value = false;

  if (!cityCode) return;

  districtLoading.value = true;
  try {
    const res = await AuthAPI.GetDistricts(cityCode);
    if (requestID !== districtRequestID) return;

    districts.value = res.data.success && Array.isArray(res.data.data)
      ? res.data.data
      : [];

    if (!districts.value.length) {
      districtError.value = "所選縣市目前沒有可選擇的鄉鎮市區";
    }
  } catch (error) {
    if (requestID !== districtRequestID) return;

    console.log("get districts error", error);
    districtError.value = "鄉鎮市區載入失敗，請稍後再試";
  }
  if (requestID === districtRequestID) {
    districtLoading.value = false;
  }
});

const initRegisterParameters = async () => {
  registerParameterLoading.value = true;
  registerParameterError.value = "";
  try {
    const res = await AuthAPI.GetRegisterParameters();
    const data = res.data.success && res.data.data ? res.data.data : {};

    memberLevels.value = Array.isArray(data.memberLevels) ? data.memberLevels : [];
    deliveryMethods.value = Array.isArray(data.deliveryMethods) ? data.deliveryMethods : [];
    businessCategories.value = Array.isArray(data.businessCategories) ? data.businessCategories : [];
    invoiceTypes.value = Array.isArray(data.invoiceTypes) ? data.invoiceTypes : [];
    cities.value = Array.isArray(data.cities) ? data.cities : [];

    if (!hasRequiredRegisterParameters.value) {
      registerParameterError.value = "註冊參數尚未完整設定，請聯絡系統管理員";
    }
  } catch (error) {
    console.log("get register parameters error", error);
    memberLevels.value = [];
    deliveryMethods.value = [];
    businessCategories.value = [];
    invoiceTypes.value = [];
    cities.value = [];
    registerParameterError.value = "註冊參數載入失敗，請稍後再試";
  }
  registerParameterLoading.value = false;
};

const initMemberRights = async () => {
  memberRightsLoading.value = true;
  memberRightsError.value = "";
  memberRights.value = null;
  memberRightsRead.value = false;
  memberRightsAccepted.value = false;

  try {
    const res = await AuthAPI.GetMemberRights();
    if (res.data.success && res.data.data) {
      memberRights.value = res.data.data;
    } else {
      memberRightsError.value = res.data.message || "目前無法取得會員權益";
    }
  } catch (error) {
    console.log("get member rights error", error);
    memberRightsError.value = "會員權益載入失敗，請稍後再試";
  }
  memberRightsLoading.value = false;
};

const checkRightsScrollPosition = () => {
  const element = rightsContentRef.value;
  if (!element) return;

  rightsScrolledToEnd.value =
    element.scrollHeight - element.scrollTop <= element.clientHeight + 4;
};

const openMemberRights = async () => {
  if (!memberRights.value) {
    ElMessage.warning(memberRightsError.value || "會員權益尚未載入完成");
    return;
  }

  rightsScrolledToEnd.value = false;
  memberRightsVisible.value = true;
  await nextTick();
  checkRightsScrollPosition();
};

const confirmMemberRights = () => {
  if (!rightsScrolledToEnd.value) {
    ElMessage.warning("請先閱讀會員權益至內容最下方");
    return;
  }

  memberRightsRead.value = true;
  memberRightsAccepted.value = true;
  memberRightsVisible.value = false;
};

const handleSubmit = async () => {
  if (!memberRights.value || !memberRightsRead.value || !memberRightsAccepted.value) {
    ElMessage.warning("請先閱讀並同意會員權益");
    return;
  }

  try {
    await formRef.value.validate();
  } catch {
    ElMessage.warning("請先完成所有必填欄位");
    return;
  }
  loading.value = true;
  try {
    const taxRes = await AuthAPI.CheckTaxID(form.taxID);
    if (taxRes.data.isDuplicate) {
      ElMessage.error("此統一編號已有公司帳號，請洽該公司管理者建立聯絡人帳號");
      loading.value = false;
      return;
    }
    const nameRes = await AuthAPI.CheckCompanyName(form.companyName);
    if (nameRes.data.isDuplicate) {
      ElMessage.error("公司名稱已存在，請確認後再試");
      loading.value = false;
      return;
    }
    const emailRes = await AuthAPI.CheckEmail(form.email);
    if (emailRes.data.isDuplicate) {
      ElMessage.error("此 Email 已被使用");
      loading.value = false;
      return;
    }
    const payload = {
      memberLevel: form.memberLevel,
      companyName: form.companyName,
      taxID: form.taxID,
      industryType: form.industryType || null,
      companyPhone: form.contactPhone || null,
      fax: form.fax || null,
      addressCity: form.addressCity,
      addressDistrict: form.addressDistrict,
      addressDetail: form.addressDetail,
      deliveryMethod: form.deliveryMethod,
      email: form.email,
      password: form.password,
      invoiceEmail: form.invoiceEmail,
      invoiceType: form.invoiceType,
      contactName: form.contactName || form.companyName,
      contactPhone: form.contactPhone || null,
      contactEmail: form.email,
      memberRightsAccepted: memberRightsAccepted.value,
      memberRightsKey: memberRights.value.pcKey,
      memberRightsHash: memberRights.value.contentHash,
    };
    const res = await AuthAPI.Register(payload, registerFile.value);
    if (res.data.success) {
      registrationComplete.value = true;
    } else {
      ElMessage.error(res.data.message || "註冊失敗");
    }
  } catch (error) {
    console.log("register error", error);
  }
  loading.value = false;
};

onMounted(() => {
  initRegisterParameters();
  initMemberRights();
});
</script>

<template>
  <div class="register-page">
    <main class="register-main">
      <!-- 完成畫面 -->
      <div v-if="registrationComplete" class="complete-card">
        <i class="bx bx-check-circle complete-icon"></i>
        <h2>感謝您的申請！</h2>
        <p>您的會員註冊已完成，請使用統一編號作為登入帳號；登入後完成首次儲值即可開通公司交易功能。</p>
        <el-button type="primary" size="large" @click="router.push('/login')">前往登入</el-button>
      </div>

      <!-- 註冊表單 -->
      <el-card v-else class="register-card" shadow="always">
        <h1 class="form-title">填寫會員資料</h1>

        <el-form
          ref="formRef"
          :model="form"
          :rules="localRules"
          label-position="left"
          label-width="130px"
          class="register-form"
        >
          <div class="section-title">公司基本資料</div>

          <el-form-item label="選擇會員等級" prop="memberLevel">
            <el-radio-group
              v-model="form.memberLevel"
              v-loading="registerParameterLoading"
              :disabled="registerParameterLoading || !memberLevels.length"
            >
              <el-radio
                v-for="level in memberLevels"
                :key="level.BACOL_ID"
                :value="level.BACOL_ID"
              >
                {{ level.BACOL_NAME }} {{ level.BACOL_DESCRIPTION }}
              </el-radio>
            </el-radio-group>
            <span v-if="registerParameterError" class="parameter-error">
              {{ registerParameterError }}
            </span>
          </el-form-item>

          <el-form-item label="會員名稱／公司" prop="companyName">
            <el-input v-model.trim="form.companyName" placeholder="若為公司戶請輸入公司全名" />
          </el-form-item>

          <el-form-item label="聯絡人姓名" prop="contactName">
            <el-input v-model.trim="form.contactName" placeholder="請輸入聯絡人姓名" />
          </el-form-item>

          <el-form-item label="產業類型">
            <el-select
              v-model="form.industryType"
              placeholder="請選擇您的行業別"
              :disabled="registerParameterLoading || !businessCategories.length"
              style="width:220px"
            >
              <el-option
                v-for="item in businessCategories"
                :key="item.BACOL_ID"
                :label="item.BACOL_NAME"
                :value="item.BACOL_ID"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="設定密碼" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              show-password
              placeholder="請輸入6-50位英數字"
              style="max-width:300px"
            />
          </el-form-item>

          <el-form-item label="再次輸入密碼" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="確認密碼，請再輸入一次"
              style="max-width:300px"
            />
          </el-form-item>

          <el-form-item label="統一編號" prop="taxID">
            <el-input v-model.trim="form.taxID" placeholder="必填，8 位數字（同時作為公司管理者登入帳號）" maxlength="8" style="max-width:360px" />
            <span class="hint-text">第一位公司管理者以統一編號登入；後續聯絡人由管理者建立並以 Email 登入。</span>
          </el-form-item>

          <el-form-item label="聯絡電話" prop="contactPhone">
            <el-input v-model.trim="form.contactPhone" placeholder="0x-xxxxxxx" style="max-width:220px" />
          </el-form-item>

          <el-form-item label="傳真號碼">
            <el-input v-model.trim="form.fax" placeholder="0x-xxxxxxx" style="max-width:220px" />
          </el-form-item>

          <el-form-item label="聯絡地址" required>
            <div class="address-row">
              <el-form-item prop="addressCity" class="no-margin">
                <el-select
                  v-model="form.addressCity"
                  placeholder="縣市"
                  :disabled="registerParameterLoading || !cities.length"
                  style="width:160px"
                >
                  <el-option
                    v-for="item in cities"
                    :key="item.BACOL_ID"
                    :label="item.BACOL_NAME"
                    :value="item.BACOL_ID"
                  />
                </el-select>
              </el-form-item>
              <el-form-item prop="addressDistrict" class="no-margin">
                <el-select
                  v-model="form.addressDistrict"
                  placeholder="鄉鎮市區"
                  :loading="districtLoading"
                  :disabled="!form.addressCity || districtLoading || !districts.length"
                  style="width:160px"
                >
                  <el-option
                    v-for="item in districts"
                    :key="item.BACOL_ID"
                    :label="item.BACOL_NAME"
                    :value="item.BACOL_ID"
                  />
                </el-select>
              </el-form-item>
            </div>
            <span v-if="districtError" class="parameter-error">
              {{ districtError }}
            </span>
            <el-form-item prop="addressDetail" class="no-margin" style="margin-top:8px">
              <el-input v-model.trim="form.addressDetail" placeholder="請輸入地址" style="max-width:460px" />
            </el-form-item>
          </el-form-item>

          <el-form-item label="取貨方式" prop="deliveryMethod">
            <el-radio-group
              v-model="form.deliveryMethod"
              :disabled="registerParameterLoading || !deliveryMethods.length"
            >
              <el-radio
                v-for="item in deliveryMethods"
                :key="item.BACOL_ID"
                :value="item.BACOL_ID"
              >
                {{ item.BACOL_NAME }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="電子信箱" prop="email">
            <el-input v-model.trim="form.email" placeholder="請輸入 email" style="max-width:360px" />
          </el-form-item>

          <el-form-item label="電子發票信箱" prop="invoiceEmail">
            <div class="invoice-email-row">
              <el-input
                v-model.trim="form.invoiceEmail"
                placeholder="請輸入 email"
                :disabled="sameAsEmail"
                style="max-width:320px"
              />
              <el-checkbox v-model="sameAsEmail" style="margin-left:12px">同上</el-checkbox>
            </div>
          </el-form-item>

          <el-form-item label="發票形式" prop="invoiceType">
            <el-radio-group
              v-model="form.invoiceType"
              :disabled="registerParameterLoading || !invoiceTypes.length"
            >
              <el-radio
                v-for="item in invoiceTypes"
                :key="item.BACOL_ID"
                :value="item.BACOL_ID"
              >
                {{ item.BACOL_NAME }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="申請附件">
            <div class="document-upload">
              <el-upload
                ref="uploadRef"
                action="#"
                :auto-upload="false"
                :limit="1"
                :accept="companyDocumentAccept"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :on-exceed="handleFileExceed"
              >
                <el-button type="primary" plain>選擇檔案</el-button>
              </el-upload>
              <span class="hint-text">選填，限 PDF、Word、Excel、JPG、PNG，檔案上限 10 MB</span>
            </div>
          </el-form-item>

          <el-form-item label="會員權益" required>
            <div class="rights-agreement">
              <el-button
                type="primary"
                link
                :loading="memberRightsLoading"
                :disabled="memberRightsLoading || !memberRights"
                @click="openMemberRights"
              >
                <i class="bx bx-book-open"></i>
                閱讀會員權益
              </el-button>
              <el-checkbox
                v-model="memberRightsAccepted"
                :disabled="!memberRightsRead"
              >
                我已閱讀並同意遵守會員權益
              </el-checkbox>
              <span v-if="memberRightsRead" class="rights-read-status">
                <i class="bx bx-check-circle"></i>
                已完成閱讀
              </span>
              <span v-if="memberRightsError" class="parameter-error">
                {{ memberRightsError }}
              </span>
            </div>
          </el-form-item>

          <div class="form-actions">
            <el-button size="large" @click="router.push('/')">取消</el-button>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              :disabled="
                registerParameterLoading ||
                memberRightsLoading ||
                !hasRequiredRegisterParameters ||
                !memberRights ||
                !memberRightsAccepted
              "
              @click="handleSubmit"
            >
              確認送出申請
            </el-button>
          </div>
        </el-form>
      </el-card>
    </main>

    <el-dialog
      v-model="memberRightsVisible"
      :title="memberRights?.title || '會員權益'"
      width="75%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <p v-if="memberRights?.summary" class="rights-summary">
        {{ memberRights.summary }}
      </p>
      <div
        ref="rightsContentRef"
        class="rights-content ql-editor"
        @scroll="checkRightsScrollPosition"
        v-html="memberRights?.introduction"
      ></div>
      <p v-if="!rightsScrolledToEnd" class="rights-scroll-hint">
        <i class="bx bx-down-arrow-alt"></i>
        請閱讀並捲動至內容最下方
      </p>
      <template #footer>
        <el-button @click="memberRightsVisible = false">稍後再閱讀</el-button>
        <el-button
          type="primary"
          :disabled="!rightsScrolledToEnd"
          @click="confirmMemberRights"
        >
          我已閱讀並同意
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%);
  display: flex;
  flex-direction: column;
}
.register-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 64px;
  background: linear-gradient(135deg, #BFF1E7 0%, #E4F4F8 58%, #F8E9E6 100%);
  border-bottom: 1px solid rgba(7, 93, 186, 0.12);
  .nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .nav-logo { height: 52px; object-fit: contain; }
  .brand-name { color: $primary; font-size: 18px; font-weight: 700; }
  .nav-actions { display: flex; align-items: center; gap: 10px; }
}
.register-main {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px 60px;
  width: 100%;
}
.register-card { border-radius: 16px; }
.form-title {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  margin: 8px 0 24px;
  color: $text-primary;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: $primary;
  padding: 8px 0 14px;
  border-bottom: 1px solid var(--el-border-color-light);
  margin-bottom: 20px;
}
.hint-text {
  font-size: 12px;
  color: $text-light;
  margin-left: 12px;
}
.parameter-error {
  width: 100%;
  margin-top: 6px;
  color: var(--el-color-danger);
  font-size: 12px;
}
.address-row { display: flex; gap: 8px; }
.invoice-email-row { display: flex; align-items: center; }
.document-upload { width: 100%; }
.rights-agreement {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  width: 100%;
}
.rights-read-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--el-color-success);
  font-size: 12px;
}
.rights-summary {
  padding: 12px 14px;
  margin: 0 0 14px;
  color: $text-light;
  line-height: 1.7;
  background: #f5f8fa;
  border-radius: 8px;
}
.rights-content {
  height: auto;
  max-height: 55vh;
  padding: 18px 20px;
  overflow-x: hidden;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  word-break: break-word;
  overflow-wrap: anywhere;

  :deep(*) {
    box-sizing: border-box;
    max-width: 100% !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }

  :deep(img),
  :deep(video),
  :deep(iframe) {
    max-width: 100%;
    height: auto;
  }

  :deep(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
  }
}
.rights-scroll-hint {
  margin: 10px 0 0;
  color: var(--el-color-warning);
  font-size: 12px;
  text-align: right;
}
.no-margin { margin-bottom: 0; }
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-light);
}
.complete-card {
  background: rgba(255, 255, 255, 0.94);
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 16px 36px rgba(7, 93, 186, 0.13);
  .complete-icon { font-size: 64px; color: #16845B; display: block; margin-bottom: 20px; }
  h2 { font-size: 24px; margin-bottom: 12px; }
  p { color: $text-light; margin-bottom: 28px; }
}
</style>
