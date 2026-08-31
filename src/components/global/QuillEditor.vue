<script setup>
import Quill from "quill";
import { toolbarOptions, toolbarOptions2 } from "@/const/editor_module";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  placeholder: String,
  simple: Boolean, // 簡易toolbar
  image: Boolean,
});

const options = reactive({
  // debug: "info",
  placeholder: props.placeholder,
  theme: "snow",
  modules: {
    toolbar: props.simple ? toolbarOptions2 : toolbarOptions,
  },
});

const editor = ref(null);

const emits = defineEmits(["update:modelValue"]);

const initEditor = (text = "") => {
  const quill = new Quill(editor.value, options);
  quill.on("text-change", () => {
    emits("update:modelValue", quill.root.innerHTML);
  });
  // quill.setText(text);
  quill.root.innerHTML = text;
};

defineExpose({ initEditor });
</script>
<template>
  <div class="my-editor">
    <div ref="editor"></div>
  </div>
</template>

<style>
@import "quill/dist/quill.snow.css";
</style>
