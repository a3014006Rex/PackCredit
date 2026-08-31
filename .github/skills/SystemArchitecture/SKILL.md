# SKILL — PackCredit 通路點數平台系統架構分析

> 適用對象：資深系統架構師
> 用途：理解系統整體架構、層次分離、模組邊界與擴充策略

---

## 一、系統定位

**PackCredit** 是「通路點數平台」的後台管理系統（Admin Portal），負責：
- 商品分類與商品目錄管理
- 企業訂單建立、追蹤與狀態管理
- 企業會員帳號管理與存取控制
- 後台人員角色權限控制

系統屬於 **B2B（Business to Business）** 企業採購平台，使用者為後台管理員與業務人員。前台公開首頁（`/`）提供最新消息、產品介紹與會員登入入口。

---

## 二、整體架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Admin Portal)                    │
│              Vue 3 SPA — PackCredit                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Router  │  │  Pinia   │  │  Axios   │  │  Plugins │  │
│  │ Vue Router│  │  Store   │  │ (API層)  │  │auth/price│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │ HTTPS REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API Server                        │
│              (VITE_BASEURL/api)                             │
│  Controllers: Account / AppUser / Product / ProductCategory  │
│               Order / Member                                │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│           External Payment Platforms                        │
│   NCCC（聯卡中心）/ BOT（台灣銀行）/ EasyWallet（悠遊付）      │
│   TaiwanPay / ApplePay / GooglePay / iPass（一卡通）         │
└─────────────────────────────────────────────────────────────┘
```

---

## 三、前端架構分層

```
src/
├── main.js              ← 應用入口、全域插件註冊
├── App.vue              ← 根元件（RouterView 入口）
│
├── router/index.js      ← 路由定義、路由守衛（requireAuth）
├── stores/auth.js       ← 全域認證狀態（Pinia）
│
├── plugins/             ← 全域功能擴充
│   ├── auth.js          ← 權限快取、$auth() 全域方法
│   ├── price.js         ← $price() 金額格式化
│   └── rules.js         ← 表單驗證規則集中管理
│
├── api/                 ← API 呼叫層（Controller 對應）
│   ├── index.js         ← Axios 實例、攔截器、錯誤處理
│   └── *.js             ← 各 Controller 對應模組
│
├── composables/         ← 可重用邏輯（Composition Functions）
│   └── useStatus.js     ← 狀態文字/樣式映射
│
├── utils/               ← 工具函式
│   ├── menuConfig.js    ← 選單名稱列舉（權限用）
│   ├── pdfGenerator.js  ← PDF 產出工具
│   └── reportConfigs.js ← 報表欄位設定
│
├── components/          ← 可重用 UI 元件
│   ├── layout/          ← 版面框架元件
│   ├── global/          ← 全域通用元件
│   ├── select/          ← 下拉選單元件集
│   └── payBill/         ← 舊版業務元件（待整理）
│
└── views/               ← 頁面元件（與路由 1:1 對應）
    ├── public/          ← 公開頁面（home.vue 首頁、login.vue 登入）
    ├── index.vue        ← 後台主框架（側邊選單 + 頂部列）
    └── main/            ← 各功能模組頁面（productCategory、product、order、member）
```

---

## 四、認證與授權架構

### 4.1 認證流程

```
登入要求
   │
   ├─ 一般登入 ──→ POST /Account/Login
   │                    │
   │              JWT Token + 使用者資料
   │                    │
   │          儲存至 Cookie (hsinchupay-admin)
   │
   └─ EIP 單一登入 ──→ POST /Account/LoginByEip
                            │
                    JWT + 選單權限資料
                            │
              儲存 token → Cookie
              儲存 roles → localStorage
```

### 4.2 授權架構（雙層快取）

```
請求授權資料
      │
      ▼
localStorage cache (hsinchupay-role)
      │
   命中快取? ──Yes──→ 直接回傳
      │
      No
      │
      ▼
API: POST /AppUser/GetUserMenuRole
      │
      ▼
寫入 reactive authState.menuRoleCache
      │
      ▼
同步回寫 localStorage
```

**Role 維度**（每個 menuName 對應）：

| Role | 用途 |
|---|---|
| `list` | 列表查詢 |
| `view` | 詳細檢視 |
| `creat` | 新增 |
| `modify` | 編輯 |
| `delete` | 刪除 |
| `import` | 匯入 |
| `export` | 匯出 |
| `refund` | 退費操作 |

### 4.3 閒置登出機制

`views/index.vue` 中實作 interval-based 閒置偵測：
- 每 1 秒計數 `idleTime`
- 達到 `idleLimit` 時清除 session 並強制跳轉登入頁
- `idleLimit` 目前設定為 60 分鐘（可調整）

---

## 五、路由架構

### 5.1 路由層次

```
/admin                    → 後台登入頁（無需認證）
/                         → 主框架（requireAuth: true）
  ├── /                   → 首頁 Dashboard
  ├── /paySubItem         → 繳費子類別（含 create / :id）
  ├── /payItem            → 繳費主類別（含 create / :id）
  ├── /payBill            → 繳費單管理（含 create / :id）
  ├── /payBillManage      → 繳費單帳務管理（含 :id）
  ├── /refundManage       → 退費管理（含 :id）
  ├── /reconcile          → 對帳及請款管理（含 :id）
  ├── /writeOffStorage    → 銷帳入庫管理（含 :id）
  ├── /payLog             → 帳務 Log（含 :id）
  ├── /report             → 帳務報表（9 種子報表）
  └── /setting            → 系統設定
        ├── /budgetUnit   → 預算科目機關代碼
        ├── /budgetItem   → 歲入預算科目
        ├── /payPlatform  → 支付平台特店（巢狀含 :id）
        ├── /reportRangeSetting → 報表金額級距設定
        └── /cronJobList  → 排程清單
```

### 5.2 路由守衛設計

路由 `meta.requireAuth` 觸發認證檢查，未登入者重導至 `/login`。

---

## 六、API 層架構

### 6.1 Axios 實例設計

`src/api/index.js` 為全域 Axios 實例，功能：

| 功能 | 實作 |
|---|---|
| Base URL | `VITE_BASEURL + "/api"` |
| JWT 注入 | 啟動時從 Cookie 讀取，設為 `Authorization: Bearer` |
| 回應攔截 | 統一處理 400/401/403/404/500/503 錯誤 |
| 401 處理 | 清除 Cookie + localStorage，跳轉登入頁 |
| 重複彈窗防護 | `isShowAlert` flag 避免多次 ElMessageBox |

### 6.2 API 模組命名對應

| 前端模組 | 後端 Controller | 主要功能 |
|---|---|---|
| `account.js` | `/Account` | 登入（一般 / EIP 單一入口） |
| `appUser.js` | `/AppUser` | 使用者資訊、選單權限 |
| `productCategory.js` | `/ProductCategory` | 商品分類 CRUD |
| `product.js` | `/Product` | 商品 CRUD |
| `order.js` | `/Order` | 訂單查詢、狀態更新、取消 |
| `member.js` | `/Member` | 會員查詢、編輯、黑名單設定 |

---

## 七、業務流程架構

### 7.1 核心帳務流程

```
繳費子類別設定 → 繳費主類別設定
         │
         ▼
    繳費單開立（含繳費管道、金額明細、通知對象）
         │
         ▼
    民眾繳費（由 client 端觸發，非本系統）
         │
         ▼
    繳費單帳務管理（查詢繳費狀態）
         │
    ┌────┴────┐
    ▼         ▼
對帳管理   退費申請
（銀行對帳）  │
    │         ▼
    ▼      退費管理（審核 / 執行退費）
銷帳入庫管理
（確認入庫）
```

### 7.2 支付管道整合

系統透過後端 API 間接串接多個支付平台：

| 支付管道 | 代碼 | 識別 key |
|---|---|---|
| 信用卡（聯卡中心 NCCC） | `isCreditCard` | `creditCard_StoreId` |
| ATM 轉帳（台灣銀行 BOT） | `isATM` | `atM_StoreId` |
| 悠遊付 EasyWallet | `isEasyWallet` | `easyWallet_StoreId` |
| 台灣 Pay | `isTaiwanPay` | `taiwanPay_StoreId` |
| Apple Pay / Google Pay | `isAppleGooglePay` | `appleGooglePay_StoreId` |
| 一卡通 iPass | `isIPass` | `iPass_StoreId` |

---

## 八、元件架構設計

### 8.1 元件分層策略

```
pages (views/)
  └─ 使用 layout 元件決定頁面框架
       └─ 使用 global 元件（PageTitle、SubTitle）
            └─ 使用 select 元件（可複用下拉）
```

### 8.2 Select 元件設計模式

所有 `src/components/select/` 下的元件遵循統一介面：
- `v-model`：雙向綁定選取 ID
- `disabled`：是否禁用
- `placeholder`：提示文字
- `@select`：選取後回傳完整資料物件（需要時）

### 8.3 Layout 元件職責

| 元件 | 職責 |
|---|---|
| `OutSideLayout` | 搜尋列表頁外框，無麵包屑 |
| `InSideLayout` | 詳細/新增/編輯頁框架，含麵包屑、頁首、操作按鈕（最多 3 個） |
| `SearchResultLayout` | 搜尋結果區（含表格、分頁） |

---

## 九、部署架構

```
開發環境
  pnpm dev / npm run dev  →  Vite Dev Server (port 8080)
  
生產環境
  Docker Build
    ├── Stage 1: node:20
    │     npm ci + npm run build → dist/
    │
    └── Stage 2: nginx:alpine
          nginx.conf → port 8080
          try_files → SPA History Mode 支援
          dist/ → /usr/share/nginx/html
```

**環境變數**（`.env` 檔案）：
- `VITE_BASEURL`：後端 API Base URL（如 `https://api.domain.com`）

---

## 十、技術債與已知限制

| 項目 | 說明 |
|---|---|
| Cookie / localStorage key | 仍使用舊有命名 `hsinchupay-admin`、`hsinchupay-role`，可日後重命名 |
| 閒置登出時間 | `index.vue` 中設定為 60 分鐘，建議移至後端設定 |
| Cookie 儲存 JWT | 7 天到期，無 refresh token 機制 |
| 已刪除檔案 | `(rm)` 前綴的檔案應從版控移除（`(rm)client.js`、`(rm)pay.js`） |
| 舊版業務元件 | `components/payBill/`、`components/payBillManage/` 為舊版遺留，可整理清除 |
