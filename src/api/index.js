import axios from "axios";
import Cookies from "js-cookie";
import router from "@/router";

// token 優先從 sessionStorage 讀取（當前分頁），fallback cookie（跨分頁保留）
const _sessionToken = sessionStorage.getItem("hsinchupay-token");
const admin = Cookies.get("hsinchupay-admin")
  ? JSON.parse(Cookies.get("hsinchupay-admin"))
  : null;

let isShowAlert = false; // 避免顯示太多次 ElMessageBox

const initToken = _sessionToken || admin?.token;
if (initToken) {
  axios.defaults.headers.common["Authorization"] = "Bearer " + initToken;
}

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_PATH || "/api";

axios.interceptors.response.use(
  (response) => {
    isShowAlert = false;
    return response;
  },
  (err) => {
    console.log("err", err);
    if (err && err.response) {
      switch (err.response.status) {
        case 400:
          ElMessage({
            message: err.response.data?.message || err.response.data?.Message || "輸入資料不正確，請確認後再試。",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          break;
        case 401:
          if (
            String(err.response.data?.errorCode || err.response.data?.ErrorCode || "")
              .toUpperCase()
              .startsWith("API_KEY_")
          ) {
            ElMessage({
              message: "API 閘道驗證失敗，請聯絡系統管理員檢查服務設定。",
              center: true,
              iconClass: "el-icon-circle-close",
              type: "error",
            });
            break;
          }
          ElMessage({
            message:
              err.response.data.ErrorMsg ||
              err.response.data.message ||
              "登入逾時或授權失敗，請重新登入。(401）",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          Cookies.remove("hsinchupay-admin");
          sessionStorage.removeItem("hsinchupay-token");
          localStorage.removeItem("hsinchupay-role");
          delete axios.defaults.headers.common["Authorization"];
          router.push("/login");
          break;
        case 403:
          ElMessage({
            message:
              err.response.data.ErrorMsg ||
              err.response.data.message ||
              "權限不足。（403）",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          break;
        case 404:
          // 靜默處理 404，避免 API 尚未實作時噴大量 popup
          console.warn("404 Not Found:", err.config?.url);
          break;
        case 500:
          ElMessage({
            message:
              err.message + "；若持續出現錯誤，請洽後端工程師。" ||
              "Something went wrong.(500)",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          console.log("500 error");
          break;
        case 503:
          ElMessage({
            message:
              err.message + "；若持續出現錯誤，請洽後端工程師。" ||
              "503 Service Unavailable",
            center: true,
            iconClass: "el-icon-circle-close",
            type: "error",
          });
          break;
        default:
          console.log(`error ${err.response.status}`);
      }
    } else {
      if (!isShowAlert) {
        ElMessageBox.alert(
          "系統更新或維護中，若持續出現此訊息請先聯絡「網路管理員」或「後端工程師」",
          "CORS",
          {
            confirmButtonText: "了解",
            type: "warning",
          }
        );
      } else {
        isShowAlert = true;
      }
    }
    return Promise.reject(err);
  }
);

const request = {
  get(url, params = {}, config = {}) {
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          ...config,
          params: params,
        })
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  post(url, data = {}, config) {
    return new Promise((resolve, reject) => {
      axios
        .post(url, data, config)
        .then(
          (response) => {
            resolve(response);
          },
          (err) => {
            reject(err);
          }
        )
        .catch((err) => {
          reject(err);
        });
    });
  },
  delete(url, data = {}) {
    return new Promise((resolve, reject) => {
      axios.delete(url, data).then(
        (response) => {
          resolve(response);
        },
        (err) => {
          reject(err);
        }
      );
    });
  },
  put(url, data = {}) {
    return new Promise((resolve, reject) => {
      axios.put(url, data).then(
        (response) => {
          resolve(response);
        },
        (err) => {
          reject(err);
        }
      );
    });
  },
};

export default request;
