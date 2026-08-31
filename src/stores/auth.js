import axios from "axios";
import { defineStore } from "pinia";
import { Account } from "@/api/account";
import { AuthAPI } from "@/api/auth";
import { reloadAuthCache, loadAllMenuRoles } from "@/plugins/auth";
import { allMenuNames } from "@/utils/menuConfig";

import Cookies from "js-cookie";

export const useAuthStore = defineStore("auth", () => {
  const router = useRouter();
  const initUser = reactive({
    email: "",
    roles: [],
    token: "",
    userId: "",
    userName: "",
    companyName: "",
    // 第三方
    ou_code: "",
    ou_name: "",
    user_name: "",
    title: "",
    eipID: "",
    // role 在localstorage
  });

  const user = reactive({ ...initUser });

  const login = async (payload) => {
    try {
      // 清除舊的權限快取（一般登入時清除，之後會動態載入）
      localStorage.removeItem("hsinchupay-role");
      
      // 1. login get token
      const res = await Account.Login(payload);
      // console.log("res", res);

      Cookies.set("hsinchupay-admin", JSON.stringify(res.data), { expires: 7 });
      // 2. set axios token
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + res.data.token;
      Object.assign(user, res.data);
      ElNotification({
        title: "系統提示",
        message: "登入成功，" + user.userName + " 歡迎回來。",
        type: "success",
        duration: 5000,
        offset: 50,
      });

      router.push("/app");
    } catch (error) {
      console.log("catch", error);
    }
  };

  const eipidLogin = async (eipid) => {
    try {
      const res = await Account.LoginByEip({ eipid });

      // EIP 登入：保持原有行為，一次性載入所有選單權限
      const roles = res.data.menuRole.data.menu.map((el) => {
        return {
          menuName: el.menuName,
          menuId: el.menuID,
          role: el.role,
        };
      });
      // roles 獨立取出存在 localstorage cookie 塞不下
      localStorage.setItem("hsinchupay-role", JSON.stringify(roles));

      // 刷新權限快取並確保所有選單權限都已載入
      reloadAuthCache();
      await loadAllMenuRoles(allMenuNames);

      Object.assign(user, res.data);
      delete user.menuRole; // 刪除多餘的資料 cookie 塞不下

      Cookies.set("hsinchupay-admin", JSON.stringify(user), { expires: 7 });
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + res.data.token;

      ElNotification({
        title: "系統提示",
        message: "登入成功，" + user.userName + " 歡迎回來。",
        type: "success",
        duration: 5000,
        offset: 50,
      });

      router.push("/app");
    } catch (error) {
      ElNotification({
        title: "系統提示",
        message: "登入失敗，" + error.response.data,
        type: "error",
        duration: 5000,
      });
      console.log("catch", error);
    }
  };

  const cleanUser = () => {
    Object.assign(user, initUser);
    Cookies.remove("hsinchupay-admin");
    sessionStorage.removeItem("hsinchupay-token");
    localStorage.removeItem("hsinchupay-role");
    delete axios.defaults.headers.common["Authorization"];
  };

  // 前台會員登入（串接 LoginAPIController）
  const memberLogin = async ({ account, password, captchaId, captchaCode }) => {
    try {
      const res = await AuthAPI.MemberLogin({
        loginAC: account,
        loginAua8: password,
        captchaId,
        captchaCode,
      });
      const data = res.data;

      if (!data.success) {
        ElMessage.error(data.message || "登入失敗");
        return false;
      }

      const userData = {
        token: data.token,
        expiresAt: data.expiresAt,
        userId: data.userInfo.userId,
        LoginID: data.userInfo.LoginID,
        userName: data.userInfo.userName,
        email: data.userInfo.email,
        department: data.userInfo.department,
        companyName: data.userInfo.companyName,
      };

      // token 儲入 sessionStorage（當前分頁會期）
      sessionStorage.setItem("hsinchupay-token", data.token);
      // 用戶資訊儲入 cookie（關窗後可持續）
      Cookies.set("hsinchupay-admin", JSON.stringify(userData), { expires: 7 });
      axios.defaults.headers.common["Authorization"] = "Bearer " + data.token;
      Object.assign(user, userData);

      ElNotification({
        title: "系統提示",
        message: "登入成功，" + data.userInfo.userName + " 歡迎回來。",
        type: "success",
        duration: 5000,
        offset: 50,
      });

      router.push("/app");
      return true;
    } catch (error) {
      console.log("memberLogin error", error);
      return false;
    }
  };

  onMounted(() => {
    const admin = Cookies.get("hsinchupay-admin")
      ? JSON.parse(Cookies.get("hsinchupay-admin"))
      : null;
    if (admin) {
      Object.assign(user, admin);
      // console.log("user:", user);
    }
  });

  return {
    user,
    login,
    eipidLogin,
    memberLogin,
    cleanUser,
  };
});
