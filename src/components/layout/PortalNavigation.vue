<script setup>
import { AuthAPI } from "@/api/auth";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { proxy } = getCurrentInstance();

const portalMenus = ref([]);
const isLoggedIn = computed(() => Boolean(authStore.user.token));
const memberAccess = reactive({
  canManageCompany: false,
  memberStatusCode: "",
});

const loadPortalMenus = async () => {
  try {
    const response = await AuthAPI.GetPortalMenus();
    portalMenus.value = response.data.success && Array.isArray(response.data.data)
      ? response.data.data
          .filter((menu) => menu.title !== "會員權益")
          .map((menu) => ({
            ...menu,
            isTargetBlank:
              menu.isTargetBlank === true ||
              menu.PC_IsTargetBlank === true ||
              menu.pC_IsTargetBlank === true,
          }))
      : [];
  } catch (error) {
    console.log("get portal navigation error", error);
    portalMenus.value = [];
  }
};

const loadMemberAccess = async () => {
  memberAccess.canManageCompany = false;
  memberAccess.memberStatusCode = "";
  if (!isLoggedIn.value) return;
  try {
    const response = await AuthAPI.GetMemberProfile();
    const data = response.data?.data;
    if (response.data?.success && data) {
      memberAccess.canManageCompany = data.account?.canManageCompany === true;
      memberAccess.memberStatusCode = data.company?.memberStatusCode || "";
    }
  } catch (error) {
    console.log("get member navigation access error", error);
  }
};

const openPortalContent = (menu) => {
  const target = router.resolve({
    name: "PortalContent",
    params: { pcKey: menu.pcKey },
  }).href;

  if (menu.isTargetBlank) {
    window.open(target, "_blank", "noopener,noreferrer");
    return;
  }

  router.push(target);
};

const logout = () => {
  ElMessageBox.confirm("確認要登出嗎？", "系統提示", {
    confirmButtonText: "確認",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    authStore.cleanUser();
    proxy.$clearAuthCache?.();
    router.replace("/");
    ElNotification({
      title: "系統提示",
      message: "您已登出。",
      type: "success",
      duration: 3000,
      offset: 50,
    });
  }).catch(() => {});
};

const handleUserCommand = (command) => {
  if (command === "memberDataChange") {
    router.push({ name: "MemberDataChanges" });
    return;
  }
  if (command === "profile") {
    router.push({ name: "MemberProfile" });
    return;
  }

  if (command === "qa") {
    router.push({ name: "CompanyQa" });
    return;
  }

  if (command === "topUp") {
    router.push({ name: "TopUp" });
    return;
  }

  if (command === "orders") {
    router.push("/order");
    return;
  }

  if (command === "companyMembers") {
    router.push({ name: "CompanyMembers" });
    return;
  }

  if (command === "logout") logout();
};

const handleMobileCommand = (command) => {
  if (typeof command === "object" && command?.type === "content") {
    openPortalContent(command.menu);
    return;
  }

  router.push(command);
};

const isActivePath = (path) => {
  if (path === "/") return route.path === "/";
  return route.path === path || route.path.startsWith(`${path}/`);
};

const isActiveContent = (menu) =>
  route.name === "PortalContent" && route.params.pcKey === menu.pcKey;

watch(isLoggedIn, loadMemberAccess, { immediate: true });
onMounted(loadPortalMenus);
</script>

<template>
  <header class="portal-navigation">
    <button type="button" class="portal-brand" aria-label="返回首頁" @click="router.push('/')">
      <img src="@/assets/images/logo.png" alt="通路點數平台" class="portal-logo" />
      <span>通路點數平台</span>
    </button>

    <nav class="portal-menu" aria-label="主要選單">
      <button
        type="button"
        class="portal-link"
        :class="{ 'is-active': isActivePath('/app') }"
        @click="router.push('/app')"
      >
        商品
      </button>
      <button
        type="button"
        class="portal-link"
        :class="{ 'is-active': isActivePath('/news') }"
        @click="router.push('/news')"
      >
        最新消息
      </button>
      <button
        v-for="menu in portalMenus"
        :key="menu.pcKey"
        type="button"
        class="portal-link"
        :class="{ 'is-active': isActiveContent(menu) }"
        @click="openPortalContent(menu)"
      >
        {{ menu.title }}
        <i v-if="menu.isTargetBlank" class="bx bx-link-external"></i>
      </button>
    </nav>

    <el-dropdown class="portal-mobile-menu" trigger="click" @command="handleMobileCommand">
      <button type="button" class="portal-icon-button" aria-label="開啟主要選單">
        <i class="bx bx-menu"></i>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="/app">商品</el-dropdown-item>
          <el-dropdown-item command="/news">最新消息</el-dropdown-item>
          <el-dropdown-item
            v-for="menu in portalMenus"
            :key="menu.pcKey"
            :command="{ type: 'content', menu }"
          >
            {{ menu.title }}
            <i v-if="menu.isTargetBlank" class="bx bx-link-external"></i>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div class="portal-actions">
      <el-dropdown v-if="isLoggedIn" trigger="click" @command="handleUserCommand">
        <button type="button" class="portal-user" aria-label="開啟會員選單">
          <i class="bx bxs-user-circle portal-user__icon"></i>
          <span class="portal-user__text">
            <strong>{{ authStore.user.companyName || authStore.user.userName }}</strong>
            <small v-if="authStore.user.companyName">{{ authStore.user.userName }}</small>
          </span>
          <i class="bx bx-chevron-down portal-user__caret"></i>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <i class="bx bx-id-card"></i>
              個人及企業資料
            </el-dropdown-item>
            <el-dropdown-item command="memberDataChange">
              <i class="bx bx-edit"></i>
              會員資料變更申請
            </el-dropdown-item>
            <el-dropdown-item command="qa">
              <i class="bx bx-message-square-dots"></i>
              公司 Q&amp;A
            </el-dropdown-item>
            <el-dropdown-item command="topUp">
              <i class="bx bx-wallet"></i>
              公司儲值
              <el-tag v-if="memberAccess.memberStatusCode === 'Member_Status_PENDING_TOPUP'" type="warning" size="small">待開通</el-tag>
            </el-dropdown-item>
            <el-dropdown-item command="orders">
              <i class="bx bx-receipt"></i>
              公司訂單
            </el-dropdown-item>
            <el-dropdown-item v-if="memberAccess.canManageCompany" command="companyMembers">
              <i class="bx bx-group"></i>
              公司聯絡人帳號
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <i class="bx bx-log-out"></i>
              登出
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button v-else type="primary" round @click="router.push('/login')">
        <i class="bx bx-log-in"></i>
        登入
      </el-button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.portal-navigation {
  position: sticky;
  top: 0;
  z-index: 1000;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 40px;
  background: linear-gradient(135deg, #bff1e7 0%, #e4f4f8 58%, #f8e9e6 100%);
  border-bottom: 1px solid rgba(7, 93, 186, .12);
  box-shadow: 0 2px 10px rgba(7, 93, 186, .1);
}

.portal-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: $primary;
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
}

.portal-logo {
  height: 54px;
  object-fit: contain;
}

.portal-menu {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-left: auto;
}

.portal-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 20px 0;
  border: 0;
  background: transparent;
  color: #1a5276;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;

  &::after {
    position: absolute;
    right: 0;
    bottom: 12px;
    left: 0;
    height: 2px;
    border-radius: 2px;
    background: $primary;
    content: "";
    opacity: 0;
    transform: scaleX(.5);
    transition: opacity .2s ease, transform .2s ease;
  }

  &:hover,
  &.is-active {
    color: $primary;
  }

  &.is-active::after {
    opacity: 1;
    transform: scaleX(1);
  }
}

.portal-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 4px;

  .el-button i {
    margin-right: 4px;
  }
}

.portal-user {
  display: flex;
  align-items: center;
  gap: 7px;
  max-width: 220px;
  padding: 5px 9px;
  border: 0;
  border-radius: 22px;
  background: transparent;
  color: #1a5276;
  font-family: inherit;
  cursor: pointer;
  transition: background-color .2s ease;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, .55);
    outline: none;
  }
}

.portal-user__icon {
  flex-shrink: 0;
  color: $primary;
  font-size: 25px;
}

.portal-user__text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.25;
  text-align: left;

  strong,
  small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong { font-size: 13px; }
  small { color: $text-light; font-size: 11px; }
}

.portal-user__caret {
  flex-shrink: 0;
  color: $text-light;
  font-size: 16px;
}

.portal-mobile-menu {
  display: none;
  margin-left: auto;
}

.portal-icon-button {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid rgba(7, 93, 186, .16);
  border-radius: 50%;
  background: rgba(255, 255, 255, .45);
  color: $primary;
  cursor: pointer;

  i { font-size: 24px; }
}

@media (max-width: 900px) {
  .portal-navigation {
    gap: 10px;
    padding: 0 16px;
  }

  .portal-menu { display: none; }
  .portal-mobile-menu { display: inline-flex; }
}

@media (max-width: 560px) {
  .portal-brand span,
  .portal-user__text,
  .portal-user__caret {
    display: none;
  }

  .portal-logo { height: 48px; }
  .portal-user { padding: 4px; }
}
</style>
