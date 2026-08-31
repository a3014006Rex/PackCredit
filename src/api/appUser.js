import request from "./index";
import axios from "axios";
import Cookies from "js-cookie";

export const AppUser = {
  // 取得目前登入者資訊
  GetLoginUser: () => {
    return request.post("/AppUser/GetLoginUser");
  },
  
  // 取得使用者選單權限
  GetUserMenuRole: (data) => {
    return request.post("/AppUser/GetUserMenuRole", data);
  },
  
  // 同步當前用戶的AD選單權限 (不顯示錯誤提示)
  SyncADUserMenuRole: () => {
    // 創建一個新的axios實例，不使用全域攔截器
    const silentAxios = axios.create({
      baseURL: import.meta.env.VITE_BASEURL + "/api"
    });
    
    // 設定授權標頭
    const admin = Cookies.get("hsinchupay-admin")
      ? JSON.parse(Cookies.get("hsinchupay-admin"))
      : null;
    
    if (admin) {
      silentAxios.defaults.headers.common["Authorization"] = "Bearer " + admin.token;
    }
    
    // 只設定成功的攔截器，不設定錯誤處理
    silentAxios.interceptors.response.use(
      (response) => response,
      (error) => {
        // 靜默處理錯誤，不顯示任何提示
        return Promise.reject(error);
      }
    );
    
    return silentAxios.get("/AppUser/SyncADUserMenuRole");
  },
};
