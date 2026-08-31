<script setup>
import dayjs from "dayjs";
import { AuthAPI } from "@/api/auth";

const loading = ref(false);
const submitting = ref(false);
const loadError = ref("");
const data = reactive({
  companyName: "", memberLevelCode: "", memberLevelName: "", memberStatusCode: "", memberStatusName: "",
  canSubmitTopUp: false, canViewBalance: false, currentBalance: 0,
  frozenBalance: 0, currencyCode: "TWD", plans: [], requests: [],
});
const formRef = ref();
const form = reactive({ topUpPlanID: "", amount: null, bankCode: "", bankAccountLast5: "" });

const pick = (item, camel, pascal) => item?.[camel] ?? item?.[pascal];
const normalizePlan = (item) => ({
  topUpPlanID: pick(item, "topUpPlanID", "TopUpPlanID"), planCode: pick(item, "planCode", "PlanCode"),
  planName: pick(item, "planName", "PlanName"), minimumAmount: Number(pick(item, "minimumAmount", "MinimumAmount") || 0),
  maximumAmount: pick(item, "maximumAmount", "MaximumAmount"), bonusType: pick(item, "bonusType", "BonusType"),
  bonusValue: Number(pick(item, "bonusValue", "BonusValue") || 0),
  memberLevelCode: pick(item, "memberLevelCode", "MemberLevelCode"),
  memberLevelName: pick(item, "memberLevelName", "MemberLevelName") || "全部會員等級",
});
const normalizeRequest = (item) => ({
  topUpRequestID: pick(item, "topUpRequestID", "TopUpRequestID"), topUpNo: pick(item, "topUpNo", "TopUpNo"),
  planName: pick(item, "planName", "PlanName") || "自由儲值", requestedAmount: Number(pick(item, "requestedAmount", "RequestedAmount") || 0),
  bonusAmount: Number(pick(item, "bonusAmount", "BonusAmount") || 0), payableAmount: Number(pick(item, "payableAmount", "PayableAmount") || 0),
  requestStatusCode: pick(item, "requestStatusCode", "RequestStatusCode"), bankCode: pick(item, "bankCode", "BankCode"),
  bankAccountLast5: pick(item, "bankAccountLast5", "BankAccountLast5"), failureMessage: pick(item, "failureMessage", "FailureMessage"),
  submittedAt: pick(item, "submittedAt", "SubmittedAt"), completedAt: pick(item, "completedAt", "CompletedAt"),
});

const selectedPlan = computed(() => data.plans.find((x) => x.topUpPlanID === form.topUpPlanID));
const payableAmount = computed(() => form.amount ? Math.round(Number(form.amount) * 1.05) : 0);
const availableBalance = computed(() => Math.max(0, data.currentBalance - data.frozenBalance));
const hasPending = computed(() => data.requests.some((x) => x.requestStatusCode === "PENDING_CONFIRMATION"));

watch(selectedPlan, (plan) => { if (plan) form.amount = plan.minimumAmount; });

const rules = {
  amount: [{ required: true, message: "請輸入儲值本金", trigger: "blur" }],
  bankCode: [{ required: true, pattern: /^\d{3,20}$/, message: "銀行代碼需為 3 至 20 位數字", trigger: "blur" }],
  bankAccountLast5: [{ required: true, pattern: /^\d{5}$/, message: "請輸入匯款帳號末五碼", trigger: "blur" }],
};

const loadData = async () => {
  loading.value = true; loadError.value = "";
  try {
    const response = await AuthAPI.GetTopUpCurrent();
    const raw = response.data?.data;
    if (!response.data?.success || !raw) throw new Error(response.data?.message || "無法取得儲值資料");
    data.companyName = pick(raw, "companyName", "CompanyName") || "";
    data.memberLevelCode = pick(raw, "memberLevelCode", "MemberLevelCode") || "";
    data.memberLevelName = pick(raw, "memberLevelName", "MemberLevelName") || "";
    data.memberStatusCode = pick(raw, "memberStatusCode", "MemberStatusCode") || "";
    data.memberStatusName = pick(raw, "memberStatusName", "MemberStatusName") || "";
    data.canSubmitTopUp = pick(raw, "canSubmitTopUp", "CanSubmitTopUp") === true;
    data.canViewBalance = pick(raw, "canViewBalance", "CanViewBalance") === true;
    data.currentBalance = Number(pick(raw, "currentBalance", "CurrentBalance") || 0);
    data.frozenBalance = Number(pick(raw, "frozenBalance", "FrozenBalance") || 0);
    data.currencyCode = pick(raw, "currencyCode", "CurrencyCode") || "TWD";
    data.plans = (pick(raw, "plans", "Plans") || []).map(normalizePlan);
    data.requests = (pick(raw, "requests", "Requests") || []).map(normalizeRequest);
  } catch (error) {
    loadError.value = error.response?.data?.message || error.message || "無法取得儲值資料";
  } finally { loading.value = false; }
};

const submit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  const plan = selectedPlan.value;
  if (Number(form.amount) < plan.minimumAmount || (plan.maximumAmount && Number(form.amount) > Number(plan.maximumAmount))) {
    ElMessage.error("儲值金額不符合所選方案範圍"); return;
  }
  try {
    await ElMessageBox.confirm(`請確認已匯款 NT$ ${payableAmount.value.toLocaleString("zh-TW")}（含稅），並送出帳號末五碼供後台核對。`, "送出儲值申請", { type: "warning" });
    submitting.value = true;
    const response = await AuthAPI.SubmitTopUp({
      topUpPlanID: form.topUpPlanID || null, amount: Number(form.amount),
      bankCode: form.bankCode.trim(), bankAccountLast5: form.bankAccountLast5.trim(),
    });
    ElMessage.success(response.data?.message || "儲值申請已送出");
    form.bankCode = ""; form.bankAccountLast5 = "";
    await loadData();
  } catch (error) {
    if (error !== "cancel") console.log("submit top-up error", error);
  } finally { submitting.value = false; }
};

const statusInfo = (code) => ({
  PENDING_CONFIRMATION: { label: "待確認匯款", type: "warning" },
  COMPLETED: { label: "已確認入帳", type: "success" }, REJECTED: { label: "已退回", type: "danger" },
}[code] || { label: code || "－", type: "info" });
const formatDateTime = (value) => value && dayjs(value).isValid() ? dayjs(value).format("YYYY/MM/DD HH:mm") : "－";

onMounted(loadData);
</script>

<template>
  <div class="top-up-page">
    <section class="page-header">
      <div><div class="eyebrow">企業帳務</div><h1>公司儲值</h1><p>{{ data.companyName }}・{{ data.memberLevelName || '會員等級載入中' }}・首次入帳完成後開通公司交易功能</p></div>
      <el-tag :type="data.memberStatusCode === 'Member_Status_NORMAL' ? 'success' : 'warning'" size="large">{{ data.memberStatusName || '載入中' }}</el-tag>
    </section>
    <main v-loading="loading" class="page-content">
      <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false"><el-button type="primary" link @click="loadData">重新載入</el-button></el-alert>
      <template v-else>
        <section v-if="data.canViewBalance" class="balance-card">
          <div><span>帳面餘額</span><strong>NT$ {{ data.currentBalance.toLocaleString('zh-TW') }}</strong><small>目前帳戶的儲值總餘額</small></div>
          <div><span>凍結額度</span><strong>NT$ {{ data.frozenBalance.toLocaleString('zh-TW') }}</strong><small>已被訂單暫時保留、尚未正式扣帳；訂單取消時會釋放</small></div>
          <div><span>可用額度</span><strong>NT$ {{ availableBalance.toLocaleString('zh-TW') }}</strong><small>帳面餘額扣除凍結額度後，可供新訂單使用</small></div>
        </section>
        <el-alert v-if="hasPending" title="已有儲值申請等待後台確認" description="後台核對匯款並入帳前，不可重複送出；可在下方查看申請狀態。" type="warning" show-icon :closable="false" />
        <section v-if="data.canSubmitTopUp" class="content-card">
          <div class="section-title"><div><h2>回報銀行匯款</h2><p>儲值本金另加 5% 營業稅；後台確認後才會增加可用額度。</p></div></div>
          <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
            <div class="form-grid">
              <el-form-item label="儲值方式" prop="topUpPlanID">
                <el-select v-model="form.topUpPlanID" style="width:100%" :disabled="hasPending"><el-option value="" label="自由儲值（不套用方案優惠）" /><el-option v-for="plan in data.plans" :key="plan.topUpPlanID" :value="plan.topUpPlanID" :label="`${plan.memberLevelName}｜${plan.planName}（最低 NT$ ${plan.minimumAmount.toLocaleString('zh-TW')}）`" /></el-select>
              </el-form-item>
              <el-form-item label="儲值金額" prop="amount"><el-input-number v-model="form.amount" :min="selectedPlan?.minimumAmount || 1" :max="selectedPlan?.maximumAmount || 99999999" :precision="0" :step="1000" controls-position="right" style="width:100%" :disabled="hasPending" /></el-form-item>
              <el-form-item label="匯款銀行代碼" prop="bankCode"><el-input v-model.trim="form.bankCode" maxlength="20" placeholder="例如：004" :disabled="hasPending" /></el-form-item>
              <el-form-item label="匯款帳號末五碼" prop="bankAccountLast5"><el-input v-model.trim="form.bankAccountLast5" maxlength="5" placeholder="5 位數字" :disabled="hasPending" /></el-form-item>
            </div>
            <div class="payable"><span>實際應匯款（含稅）</span><strong>NT$ {{ payableAmount.toLocaleString('zh-TW') }}</strong></div>
            <div class="form-actions"><el-button type="primary" size="large" :loading="submitting" :disabled="hasPending" @click="submit">我已匯款，送出核對</el-button></div>
          </el-form>
        </section>
        <section class="content-card">
          <div class="section-title"><div><h2>儲值申請紀錄</h2><p>顯示最近 20 筆申請。</p></div></div>
          <el-table :data="data.requests" stripe>
            <el-table-column prop="topUpNo" label="申請單號" min-width="190" />
            <el-table-column prop="planName" label="儲值方式" min-width="130" />
            <el-table-column label="本金" width="120" align="right"><template #default="{ row }">{{ row.requestedAmount.toLocaleString('zh-TW') }}</template></el-table-column>
            <el-table-column label="含稅匯款" width="130" align="right"><template #default="{ row }">{{ row.payableAmount.toLocaleString('zh-TW') }}</template></el-table-column>
            <el-table-column label="帳號末五碼" width="120"><template #default="{ row }">{{ row.bankAccountLast5 || '－' }}</template></el-table-column>
            <el-table-column label="狀態" width="130"><template #default="{ row }"><el-tag :type="statusInfo(row.requestStatusCode).type">{{ statusInfo(row.requestStatusCode).label }}</el-tag></template></el-table-column>
            <el-table-column label="申請時間" width="160"><template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template></el-table-column>
            <el-table-column label="說明" min-width="180"><template #default="{ row }">{{ row.failureMessage || '－' }}</template></el-table-column>
          </el-table>
          <el-empty v-if="!data.requests.length" description="尚無儲值申請" />
        </section>
      </template>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.top-up-page{min-height:100%;padding:32px;background:radial-gradient(circle at top right,rgba(27,154,170,.12),transparent 30%),#f5f7fa}.page-header,.page-content{max-width:1040px;margin:0 auto}.page-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px;h1{margin:4px 0 6px;font-size:30px;color:$text-primary}p{margin:0;color:$text-light}}.eyebrow{color:$primary;font-size:13px;font-weight:700;letter-spacing:.12em}.page-content{display:grid;gap:18px}.balance-card{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;overflow:hidden;border-radius:14px;background:rgba(255,255,255,.35);box-shadow:0 6px 18px rgba(26,82,118,.06);div{display:flex;flex-direction:column;gap:8px;padding:22px;background:#fff}span{color:$text-light;font-size:13px}strong{color:$primary;font-size:26px}small{color:$text-light;line-height:1.55}}.content-card{padding:24px;border:1px solid #e6ebf1;border-radius:14px;background:#fff;box-shadow:0 6px 18px rgba(26,82,118,.06)}.section-title{margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid #edf1f5;h2{margin:0 0 5px;color:$text-primary;font-size:19px}p{margin:0;color:$text-light;font-size:13px}}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 18px}.payable{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-radius:10px;background:#f2f8ff;span{color:$text-light}strong{color:$primary;font-size:23px}}.form-actions{display:flex;justify-content:flex-end;margin-top:18px}@media(max-width:700px){.top-up-page{padding:22px 14px}.page-header{align-items:flex-start}.balance-card,.form-grid{grid-template-columns:1fr}.content-card{padding:18px 14px}}
</style>
