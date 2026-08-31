<script setup>
import { Unit } from "@/api/unit";

const props = defineProps({
  modelValue: [Number, Array],
  disabled: Boolean,
  multiple: Boolean,
  placeholder: {
    type: String,
    default: "請選擇隸屬機關",
  },
  type: {
    type: String,
  },
});

const emits = defineEmits(["update:modelValue"]);

const form = reactive({
  name: "",
  pageRequestParameter: {
    isReturnAllDataAndNoPage: true,
    targetPage: 0,
    showCount: 0,
  },
});

const data = reactive({
  list: [],
});

const initUnit = async () => {
  try {
    const res = await Unit.List(form);
     console.log("res", res);
    data.list = res.data.data;
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  initUnit();
});
</script>

<template>
  <el-select
    :modelValue="modelValue"
    @clear="$emit('update:modelValue', null)"
    @update:modelValue="$emit('update:modelValue', $event)"
    :placeholder="placeholder"
    filterable
    clearable
    :multiple="multiple"
    :disabled="disabled"
  >
    <el-option :label="i.unitName" :value="i.id" v-for="i in data.list" />
  </el-select>
</template>
