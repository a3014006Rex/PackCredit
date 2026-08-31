<script setup>
const props = defineProps({
  modelValue: String,
  disabled: Boolean,
  placeholder: {
    type: String,
    default: "請選擇會員狀態",
  },
});

const emits = defineEmits(["update:modelValue"]);

const statusOptions = [
  { value: "正常", label: "正常" },
  { value: "停用", label: "停用" },
  { value: "黑名單", label: "黑名單" },
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
