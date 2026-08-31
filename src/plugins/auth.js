import { AppUser } from "@/api/appUser";
import { reactive } from "vue";

// 使用 reactive 讓權限資料具有響應式
const authState = reactive({
  menuRoleCache: {},
  isLoading: false,
  isInitialized: false,
});

// 從 localStorage 初始化快取
const initCache = () => {
  try {
    const stored = localStorage.getItem("hsinchupay-role");
    if (stored) {
      const cacheArray = JSON.parse(stored);
      // 將陣列轉換為物件，方便快速查詢
      cacheArray.forEach(item => {
        authState.menuRoleCache[item.menuName] = item;
      });
    }
    authState.isInitialized = true;
  } catch (error) {
    console.error("初始化權限快取失敗:", error);
    authState.menuRoleCache = {};
    authState.isInitialized = true;
  }
};

// 呼叫 API 取得單一選單權限（正確的 async/await）
const fetchMenuRole = async (menuName) => {
  try {
    const res = await AppUser.GetUserMenuRole({ MenuName: menuName });

    if (res.data && res.status == 200) {
      const menuRole = {
        menuName: res.data.menuName,
        menuId: res.data.menuId,
        role: {
          creat: res.data.roleCreate,
          modify: res.data.roleModify,
          delete: res.data.roleDelete,
          list: res.data.roleList,
          view: res.data.roleView,
          import: res.data.roleImport,
          export: res.data.roleExport,
          refund: res.data.roleRefund,
        }
      };
      return menuRole;
    }
    return null;
  } catch (error) {
    console.error(`尚未賦予選單權限 [${menuName}]:`, error);
    return null;
  }
};

// 更新快取到 localStorage
const saveCache = () => {
  try {
    const cacheArray = Object.values(authState.menuRoleCache);
    localStorage.setItem("hsinchupay-role", JSON.stringify(cacheArray));
  } catch (error) {
    console.error("儲存權限快取失敗:", error);
  }
};

// 批次載入所有選單權限
export const loadAllMenuRoles = async (menuNames) => {
  if (!menuNames || menuNames.length === 0) return;
  
  authState.isLoading = true;
  
  try {
    // 並行載入所有選單權限
    const promises = menuNames.map(async (menuName) => {
      // 如果快取中已存在，跳過
      if (authState.menuRoleCache[menuName]) {
        return;
      }

      const menuRole = await fetchMenuRole(menuName);
      if (menuRole) {
        authState.menuRoleCache[menuName] = menuRole;
      } else {
        // API 失敗或無權限，設定預設值
        authState.menuRoleCache[menuName] = {
          menuName: menuName,
          menuId: "",
          role: {
            creat: false,
            modify: false,
            delete: false,
            list: false,
            view: false,
            import: false,
            export: false,
            refund: false,
          }
        };
      }
    });

    await Promise.all(promises);
    saveCache();
  } catch (error) {
    console.error("批次載入權限失敗:", error);
  } finally {
    authState.isLoading = false;
  }
};

// 重新載入快取
export const reloadAuthCache = function () {
  authState.menuRoleCache = {};
  authState.isInitialized = false;
  initCache();
};

export default {
  install(app, options) {
    // 主要的權限檢查函數（同步，從快取讀取）
    app.config.globalProperties.$auth = function (name, action) {
      // 確保已初始化
      if (!authState.isInitialized) {
        initCache();
      }

      // 從快取中查詢
      const menu = authState.menuRoleCache[name];

      if (menu && menu.role) {
        return menu.role[action] === true;
      }

      // 如果快取中沒有，返回 false（預設無權限）
      return false;
    };

    // 非同步載入單一選單權限（供特殊情況使用）
    app.config.globalProperties.$loadMenuAuth = async function (menuName) {
      const menuRole = await fetchMenuRole(menuName);
      if (menuRole) {
        authState.menuRoleCache[menuName] = menuRole;
        saveCache();
        return menuRole;
      } else {
        authState.menuRoleCache[menuName] = {
          menuName: menuName,
          menuId: "",
          role: {
            creat: false,
            modify: false,
            delete: false,
            list: false,
            view: false,
            import: false,
            export: false,
            refund: false,
          }
        };
        saveCache();
        return null;
      }
    };

    // 批次載入所有選單權限
    app.config.globalProperties.$loadAllMenuAuth = loadAllMenuRoles;

    // 清除快取
    app.config.globalProperties.$clearAuthCache = function () {
      authState.menuRoleCache = {};
      authState.isInitialized = false;
      localStorage.removeItem("hsinchupay-role");
    };

    // 重新載入快取
    app.config.globalProperties.$reloadAuthCache = reloadAuthCache;

    // 取得權限狀態（供偵錯使用）
    app.config.globalProperties.$getAuthState = function () {
      return {
        isLoading: authState.isLoading,
        isInitialized: authState.isInitialized,
        cacheCount: Object.keys(authState.menuRoleCache).length,
        cache: authState.menuRoleCache,
      };
    };

    // 初始化快取
    initCache();
  },
};
