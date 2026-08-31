<script setup>
import "quill/dist/quill.snow.css";
import Quill from "quill";

const editor = ref(null);
const toolbarOptions = [
  [
    { size: ["small", false, "large", "huge"] },
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "link",
  ],
  [{ color: [] }, { background: [] }],
  [{ align: [] }, { list: "ordered" }, { list: "bullet" }],
  ["clean"], // remove formatting button
];

const props = defineProps({
  modelValue: {
    type: [String, null],
    required: true,
  },
  disabled: Boolean,
  placeholder: String,
});

const options = reactive({
  // debug: "info",
  theme: "snow",
  placeholder: props.placeholder,
  modules: {
    table: false,
    toolbar: toolbarOptions,
  },
});

const emits = defineEmits(["update:modelValue"]);

const initEditor = (text = "") => {
  const quill = new Quill(editor.value, options);

  quill.on("text-change", () => {
    emits("update:modelValue", quill.root.innerHTML);
  });
  // quill.setText(text);
  quill.root.innerHTML = text;
  quill.enable(!props.disabled);
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
