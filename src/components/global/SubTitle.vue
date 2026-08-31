<script setup>
const emit = defineEmits(["click"]);
const props = defineProps({
  title: {
    type: String,
    default: "Enter Your Sub title",
  },
  note: {
    type: String,
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
  <div class="sub-title">
    <span>{{ title }}</span>
    <p v-if="note" class="note">{{ note }}</p>
  </div>
</template>

<style lang="scss" scoped>
.sub-title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed rgba($primary, 0.2);
  span {
    display: block;
    font-size: 16px;
    padding-left: 10px;
    padding-bottom: 2px;
    border-left: 2px solid $primary;
    line-height: 20px;
    margin-right: 20px;
    font-weight: bold;
  }
  .note {
    font-size: 14px;
    margin: 0;
    &:before {
      content: "※";
    }
  }
}
</style>
