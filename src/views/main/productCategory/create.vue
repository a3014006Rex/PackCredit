<script setup>
import { ProductCategory } from "@/api/productCategory";
import { ProductCategory as rules } from "@/plugins/rules";

const router = useRouter();
const loading = ref(false);
const formRef = ref();

const form = reactive({
  name: "",
  sort: 0,
  isActive: true,
  description: "",
});

const handleSubmit = async () => {
  await formRef.value.validate();
  loading.value = true;
  try {
    await ProductCategory.Create(form);
    ElNotification({ title: "系統提示", message: "新增成功", type: "success" });
    router.back();
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};
</script>

<template>
  <InSideLayout
    click1="取消"
    click2="確認新增"
    :loading="loading"
    @back="router.back()"
    @click1="router.back()"
    @click2="handleSubmit"
  >
    <template #title>新增商品分類</template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
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
