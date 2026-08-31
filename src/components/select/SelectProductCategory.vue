<script setup>
import { ProductCategory } from "@/api/productCategory";

const props = defineProps({
  modelValue: Number,
  disabled: Boolean,
  placeholder: {
    type: String,
    default: "請選擇商品分類",
  },
});

const emits = defineEmits(["update:modelValue"]);
const loading = ref(false);
const data = reactive({ list: [] });

const initList = async () => {
  loading.value = true;
  try {
    const res = await ProductCategory.List({
      pageRequestParameter: {
        isReturnAllDataAndNoPage: true,
        targetPage: 0,
        showCount: 0,
      },
    });
    data.list = res.data.data;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

onMounted(() => {
  initList();
});
</script>

<template>
  <el-select
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    clearable
  >
    <el-option
      v-for="item in data.list"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    />
  </el-select>
</template>
