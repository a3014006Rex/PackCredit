<script setup>
const props = defineProps({
  modelValue: String,
  disabled: Boolean,
  placeholder: {
    type: String,
    default: "請選擇訂單狀態",
  },
});

const emits = defineEmits(["update:modelValue"]);

const statusOptions = [
  { value: "待確認", label: "待確認" },
  { value: "已確認", label: "已確認" },
  { value: "備貨中", label: "備貨中" },
  { value: "已出貨", label: "已出貨" },
  { value: "已完成", label: "已完成" },
  { value: "已取消", label: "已取消" },
  { value: "退貨處理中", label: "退貨處理中" },
  { value: "已退款", label: "已退款" },
];
</script>

<template>
  <el-select
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
    :placeholder="placeholder"
    :disabled="disabled"
    clearable
  >
    <el-option
      v-for="item in statusOptions"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
