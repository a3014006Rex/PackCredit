<script setup>
const props = defineProps({
  modelValue: Boolean,
  disabled: Boolean,
  placeholder: {
    type: String,
    default: "請選擇狀態",
  },
});

const emits = defineEmits(["update:modelValue"]);
</script>

<template>
  <el-select
    :modelValue="modelValue"
    @clear="$emit('update:modelValue', null)"
    @update:modelValue="$emit('update:modelValue', $event)"
    :placeholder="placeholder"
    filterable
    clearable
    :disabled="disabled"
  >
    <el-option label="啟用" :value="true" />
    <el-option label="停用" :value="false" />
  </el-select>
</template>
