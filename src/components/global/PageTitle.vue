<script setup>
const emit = defineEmits(["click"]);
const props = defineProps({
  title: {
    type: String,
    default: "Enter Your title",
  },
  button: {
    type: String,
  },
  icon: {
    type: String,
  },
  plain: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const handleClick = () => {
  emit("click");
};
</script>

<template>
  <div class="page-title">
    <h1>{{ title }}</h1>
    <el-button
      :icon="icon"
      :plain="plain"
      :disabled="disabled"
      v-if="button"
      type="primary"
      @click="handleClick"
      >{{ button }}
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.page-title {
  padding: 5px 0;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  h1 {
    font-size: 2rem;
    color: #383838;
    letter-spacing: 1px;
    font-weight: bold;
    margin-right: 20px;
    margin-top: 0px;
    margin-bottom: 0px;
  }
  .el-button {
    margin-left: auto;
  }
}
</style>
