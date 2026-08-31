<template>
  <el-pagination
    v-if="data"
    style="margin-top: 20px"
    background
    size="small"
    layout="total, sizes, prev, pager, next"
    :page-sizes="[10, 50, 100]"
    :page-size="props.data.pageSize"
    :page-count="props.data.totalPage"
    :total="props.data.totalCount"
    :current-page="props.data.currentPage"
    @current-change="handleCurrentChange"
    @size-change="handleSizeChange"
  ></el-pagination>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: {
      pageSize: 10,
      totalPage: 1,
      totalCount: 1,
      currentPage: 1,
    },
  },
});
const emit = defineEmits(["updatePage", "updateSize"]);

const handleCurrentChange = (val) => {
  emit("updatePage", val);
};
const handleSizeChange = (val) => {
  emit("updateSize", val);
};
</script>

<style lang="scss" scoped>
.el-pagination {
  margin: 10px 0;
}
</style>
