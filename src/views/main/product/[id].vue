<script setup>
import { Product } from "@/api/product";
import { Product as rules } from "@/plugins/rules";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const formRef = ref();

const form = reactive({
  name: "",
  categoryId: null,
  price: 0,
  stock: 0,
  unit: "",
  description: "",
  isActive: true,
  specifications: [],
});

const initData = async () => {
  loading.value = true;
  try {
    const res = await Product.GetById(route.params.id);
    Object.assign(form, res.data);
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleAddSpec = () => {
  form.specifications.push({ name: "", value: "" });
};

const handleRemoveSpec = (index) => {
  form.specifications.splice(index, 1);
};

const handleSubmit = async () => {
  await formRef.value.validate();
  loading.value = true;
  try {
    await Product.Update(route.params.id, form);
    ElNotification({ title: "系統提示", message: "更新成功", type: "success" });
    router.back();
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleDelete = async () => {
  await ElMessageBox.confirm("確定要刪除此商品嗎？", "系統提示", {
    confirmButtonText: "確認",
    cancelButtonText: "取消",
    type: "warning",
  });
  loading.value = true;
  try {
    await Product.Delete(route.params.id);
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
    <template #title>編輯商品</template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" v-loading="loading">
      <el-form-item label="商品名稱" prop="name">
        <el-input v-model="form.name" placeholder="請輸入商品名稱" />
      </el-form-item>
      <el-form-item label="商品分類" prop="categoryId">
        <SelectProductCategory v-model="form.categoryId" />
      </el-form-item>
      <el-form-item label="售價" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="0" />
        <span class="ml-2">元</span>
      </el-form-item>
      <el-form-item label="庫存數量" prop="stock">
        <el-input-number v-model="form.stock" :min="0" />
      </el-form-item>
      <el-form-item label="單位">
        <el-input v-model="form.unit" placeholder="例：件、箱、組" style="width: 150px" />
      </el-form-item>
      <el-form-item label="商品描述">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="請輸入商品描述" />
      </el-form-item>

      <!-- 商品規格 -->
      <el-form-item label="商品規格">
        <div style="width: 100%">
          <div
            v-for="(spec, index) in form.specifications"
            :key="index"
            class="spec-row"
          >
            <el-input v-model="spec.name" placeholder="規格名稱" style="width: 180px" />
            <span class="mx-2">：</span>
            <el-input v-model="spec.value" placeholder="規格值" style="width: 180px" />
            <el-button type="danger" :icon="Delete" circle size="small" class="ml-2" @click="handleRemoveSpec(index)" />
          </div>
          <el-button type="primary" plain size="small" @click="handleAddSpec">+ 新增規格</el-button>
        </div>
      </el-form-item>

      <el-form-item label="狀態">
        <el-switch v-model="form.isActive" active-text="上架" inactive-text="下架" />
      </el-form-item>
    </el-form>
  </InSideLayout>
</template>

<style lang="scss" scoped>
.spec-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.ml-2 { margin-left: 8px; }
.mx-2 { margin: 0 8px; }
</style>
