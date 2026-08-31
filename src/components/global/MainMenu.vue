<script setup>
const route = useRoute();
const router = useRouter();
const props = defineProps(["isCollapse"]);
const path = ref("");

const instance = getCurrentInstance();
const $auth = instance?.proxy?.$auth;
const hasAnyAuth = (permissions) => permissions.some(perm => $auth(perm, 'list'));

const subMenuItems = {
  product: [
    { index: '/productCategory', label: '商品分類管理', perm: '商品分類管理' },
    { index: '/product', label: '商品管理', perm: '商品管理' },
  ],
};

const subMenuPermissions = {
  product: subMenuItems.product.map(item => item.perm),
};

const getVisibleItems = (items) => items.filter(item => $auth(item.perm, 'list'));

// const logout = () => {
//   ElMessageBox.confirm("確認要登出嗎", "系統提示", {
//     confirmButtonText: "確認",
//     cancelButtonText: "取消",
//     type: "warning",
//   })
//     .then(() => {
//       store.cleanUser();
//       router.replace("/auth");
//     })
//     .catch(() => {});
// };

onBeforeRouteUpdate((to) => {
  path.value = to.path;
});

onMounted(() => {
  path.value = route.path;
});
</script>

<template>
  <div class="main-menu">
    <el-menu :default-active="path" :collapse="isCollapse" router>
      <el-menu-item index="/">
        <el-icon><i class="bx bx-home-alt-2"></i></el-icon>
        <template #title>首頁</template>
      </el-menu-item>

      <!-- 商品管理 -->
      <el-sub-menu index="/product" v-if="hasAnyAuth(subMenuPermissions.product)">
        <template #title>
          <el-icon><i class="bx bx-package"></i></el-icon>
          <span>商品管理</span>
        </template>
        <el-menu-item v-for="item in getVisibleItems(subMenuItems.product)" :key="item.index" :index="item.index">{{ item.label }}</el-menu-item>
      </el-sub-menu>

      <!-- 訂單管理 -->
      <el-menu-item index="/order" v-if="$auth('訂單管理', 'list')">
        <el-icon><i class="bx bx-receipt"></i></el-icon>
        <template #title>訂單管理</template>
      </el-menu-item>

      <!-- 會員管理 -->
      <el-menu-item index="/member" v-if="$auth('會員管理', 'list')">
        <el-icon><i class="bx bx-user"></i></el-icon>
        <template #title>會員管理</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style lang="scss" scoped>
.main-menu {
  background-color: white;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
  // min-width: 220px;
}
</style>
