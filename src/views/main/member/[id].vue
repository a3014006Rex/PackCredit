<script setup>
import { Member } from "@/api/member";

const router = useRouter();
const route = useRoute();
const loading = ref(false);

const member = reactive({
  companyName: "",
  taxId: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  status: "正常",
  registerDate: "",
  note: "",
});

const initData = async () => {
  loading.value = true;
  try {
    const res = await Member.GetById(route.params.id);
    Object.assign(member, res.data);
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleSetBlacklist = async () => {
  const isBlacklist = member.status !== "黑名單";
  const msg = isBlacklist ? "確定將此會員加入黑名單嗎？" : "確定將此會員從黑名單移除嗎？";
  await ElMessageBox.confirm(msg, "系統提示", {
    confirmButtonText: "確認",
    cancelButtonText: "取消",
    type: "warning",
  });
  loading.value = true;
  try {
    await Member.SetBlacklist(route.params.id, { isBlacklist });
    member.status = isBlacklist ? "黑名單" : "正常";
    ElNotification({ title: "系統提示", message: "操作成功", type: "success" });
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleToggleStatus = async () => {
  const nextStatus = member.status === "停用" ? "正常" : "停用";
  await ElMessageBox.confirm(`確定將會員狀態更改為「${nextStatus}」嗎？`, "系統提示", {
    confirmButtonText: "確認",
    cancelButtonText: "取消",
    type: "warning",
  });
  loading.value = true;
  try {
    await Member.Update(route.params.id, { status: nextStatus });
    member.status = nextStatus;
    ElNotification({ title: "系統提示", message: "狀態更新成功", type: "success" });
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const getStatusClass = (status) => {
  const map = { "正常": "green", "停用": "secondary", "黑名單": "red" };
  return map[status] || "";
};

onMounted(() => {
  initData();
});
</script>

<template>
  <InSideLayout
    click1="返回列表"
    :click2="member.status === '停用' ? '啟用帳號' : '停用帳號'"
    :click3="member.status === '黑名單' ? '移除黑名單' : '加入黑名單'"
    :loading="loading"
    @back="router.back()"
    @click1="router.back()"
    @click2="handleToggleStatus"
    @click3="handleSetBlacklist"
  >
    <template #title>會員詳細</template>

    <div v-loading="loading">
      <el-card>
        <template #header>
          <span>企業會員資訊</span>
          <el-tag
            :type="member.status === '正常' ? 'success' : member.status === '黑名單' ? 'danger' : 'info'"
            class="ml-4"
          >{{ member.status }}</el-tag>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="企業名稱">{{ member.companyName }}</el-descriptions-item>
          <el-descriptions-item label="統一編號">{{ member.taxId }}</el-descriptions-item>
          <el-descriptions-item label="聯絡人">{{ member.contactName }}</el-descriptions-item>
          <el-descriptions-item label="電話">{{ member.phone }}</el-descriptions-item>
          <el-descriptions-item label="Email">{{ member.email }}</el-descriptions-item>
          <el-descriptions-item label="公司地址">{{ member.address }}</el-descriptions-item>
          <el-descriptions-item label="註冊時間">{{ member.registerDate }}</el-descriptions-item>
          <el-descriptions-item label="備註">{{ member.note }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </InSideLayout>
</template>

<style lang="scss" scoped>
.ml-4 { margin-left: 16px; }
</style>
