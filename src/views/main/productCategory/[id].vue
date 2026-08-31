<script setup>
import { ProductCategory } from "@/api/productCategory";
import { ProductCategory as rules } from "@/plugins/rules";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const formRef = ref();

const form = reactive({
  name: "",
  sort: 0,
  isActive: true,
  description: "",
});

const initData = async () => {
  loading.value = true;
  try {
    const res = await ProductCategory.GetById(route.params.id);
    Object.assign(form, res.data);
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleSubmit = async () => {
  await formRef.value.validate();
  loading.value = true;
  try {
    await ProductCategory.Update(route.params.id, form);
    ElNotification({ title: "系統提示", message: "更新成功", type: "success" });
    router.back();
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleDelete = async () => {
  await ElMessageBox.confirm("確定要刪除此分類嗎？", "系統提示", {
    confirmButtonText: "確認",
    cancelButtonText: "取消",
    type: "warning",
  });
  loading.value = true;
  try {
    await ProductCategory.Delete(route.params.id);
    ElNotification({ title: "系統提示", message: "刪除成功", type: "success" });
    router.back();
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

onMounted(() => {
  initData();
});
</script>

<template>
  <InSideLayout
    click1="取消"
    click2="儲存"
    click3="刪除"
    :loading="loading"
    @back="router.back()"
    @click1="router.back()"
    @click2="handleSubmit"
    @click3="handleDelete"
  >
    <template #title>編輯商品分類</template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" v-loading="loading">
      <el-form-item label="分類名稱" prop="name">
        <el-input v-model="form.name" placeholder="請輸入分類名稱" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="請輸入分類描述" />
      </el-form-item>
      <el-form-item label="狀態">
        <el-switch v-model="form.isActive" active-text="啟用" inactive-text="停用" />
      </el-form-item>
    </el-form>
  </InSideLayout>
</template>

<style lang="scss" scoped></style>
