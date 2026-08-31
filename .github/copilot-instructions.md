# GitHub Copilot Instructions — PackCredit 通路點數平台後台

> 本檔案為 GitHub Copilot 的專案級指引，適用於本專案所有 Vue 3 前端開發工作。
> 所有建議皆應符合本專案既有程式碼風格與架構慣例。

---

## 一、專案概述

- **專案名稱**：PackCredit（通路點數平台後台管理系統）
- **技術棧**：Vue 3 (Composition API `<script setup>`) + Vite 5 + Element Plus + Pinia + Vue Router 4
- **語言**：繁體中文介面，程式碼以英文命名，註解用中文
- **部署**：Docker Multi-stage + Nginx（port 8080）
- **路由架構**：`/` 公開首頁、`/login` 登入頁（含驗證碼）、`/app` 後台管理（requireAuth）
- **功能模組**：商品分類管理、商品管理、訂單管理、會員管理

---

## 二、Vue 元件開發規範

### 2.1 `<script setup>` 優先

所有 Vue SFC 一律使用 `<script setup>` 語法，不使用 Options API：

```vue
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const loading = ref(false);
const form = reactive({ ... });
</script>
```

### 2.2 自動引入（Auto Import）

以下 API **不需要 import**，由 `unplugin-auto-import` 自動注入：
- Vue Composition API：`ref`, `reactive`, `computed`, `watch`, `watchEffect`, `onMounted`, `onBeforeRouteUpdate` 等
- Vue Router：`useRouter`, `useRoute`
- Element Plus：`ElMessage`, `ElMessageBox`, `ElNotification`

若看到手動 import，屬於舊版遺留寫法，**新增程式碼不需要手動 import 上述 API**。

### 2.3 路徑別名

使用 `@` 代表 `src/` 目錄：

```js
import { Product } from "@/api/product";
import { useStatus } from "@/composables/useStatus";
import InSideLayout from "@/components/layout/InSideLayout.vue";
```

---

## 三、狀態管理規範

### 3.1 頁面本地狀態

使用 `reactive` 管理表單和資料物件，使用 `ref` 管理單一值：

```js
// 查詢表單 - 用 reactive
const form = reactive({
  name: "",
  categoryId: null,
  pageRequestParameter: {
    isReturnAllDataAndNoPage: false,
    targetPage: 1,
    showCount: 10,
  },
});

// 資料列表狀態 - 用 reactive
const data = reactive({
  list: [],
  pagination: null,
});

// 單一布林值 - 用 ref
const loading = ref(false);
```

### 3.2 分頁標準格式

所有列表查詢的分頁參數必須包含：

```js
pageRequestParameter: {
  isReturnAllDataAndNoPage: false,  // 是否不分頁取全部
  targetPage: 1,
  showCount: 10,
},
```

### 3.3 Pinia Store（全域狀態）

全域狀態（認證、使用者資訊）集中在 `src/stores/auth.js`，以 `useAuthStore()` 存取。

---

## 四、API 呼叫規範

### 4.1 API 模組結構

每個 API 模組對應後端一個 Controller，放在 `src/api/` 目錄，統一透過 `src/api/index.js` 的 Axios 實例：

```js
// src/api/product.js
import request from "./index";

export const Product = {
  List: (data) => request.post("/Product/List", data),
  GetById: (id) => request.get(`/Product/${id}`),
  Create: (data) => request.post("/Product", data),
  Update: (id, data) => request.put(`/Product/${id}`, data),
  Delete: (id) => request.delete(`/Product/${id}`),
};
```

### 4.2 非同步呼叫標準寫法

```js
const loading = ref(false);

const initList = async () => {
  loading.value = true;
  try {
    const res = await SomeAPI.List(form);
    data.list = res.data.data;
    data.pagination = res.data.pagination;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

onMounted(() => {
  initList();
});
```

### 4.3 資料送出前預處理

送出前需將空值轉為 `null`，空字串需 trim：

```js
const queryData = {
  ...form,
  name: form.name?.trim() || null,
  dateRange: form.dateRange?.length ? form.dateRange : null,
};
```

---

## 五、元件使用規範

### 5.1 版面元件

| 元件 | 用途 |
|---|---|
| `<InSideLayout>` | 詳細頁（含麵包屑、頁首、操作按鈕） |
| `<OutSideLayout>` | 列表搜尋頁外框 |
| `<SearchResultLayout>` | 搜尋結果區塊 |
| `<PageTitle>` | 頁面標題 |

### 5.2 InSideLayout 使用方式

```vue
<InSideLayout
  click1="取消"
  click2="儲存"
  :loading="loading"
  @back="router.back()"
  @click1="router.back()"
  @click2="handleSubmit"
>
  <template #title>新增商品</template>
  <!-- 頁面內容 -->
</InSideLayout>
```

`click1`（灰色）、`click2`（主色）、`click3`（紅色危險）對應三種操作按鈕。

### 5.3 Select 下拉元件

`src/components/select/` 下有封裝好的下拉元件，使用 `v-model` 綁定 ID：

```vue
<SelectProductCategory v-model="form.categoryId" />
<SelectOrderStatus v-model="form.orderStatus" />
<SelectMemberStatus v-model="form.memberStatus" />
```

---

## 六、權限控制規範

### 6.1 全域 `$auth` 函式

在 `<template>` 或 `<script setup>` 中使用 `$auth(menuName, role)` 控制元素顯示：

```vue
<template>
  <!-- 在模板中 -->
  <el-button v-if="$auth('商品管理', 'creat')">新增</el-button>
  <el-button v-if="$auth('商品管理', 'modify')">編輯</el-button>
  <el-button v-if="$auth('商品管理', 'delete')">刪除</el-button>
</template>

<script setup>
// 在 script 中
import { getCurrentInstance } from "vue";
const { proxy } = getCurrentInstance();
// 注意：自動引入不包含此用法，需手動取得 proxy
</script>
```

可用的 role 值：`creat` / `modify` / `delete` / `list` / `view` / `import` / `export` / `refund`

### 6.2 菜單權限批次判斷

```js
const hasAnyAuth = (permissions) => permissions.some(perm => $auth(perm, 'list'));
```

---

## 七、路由規範

### 7.1 路由結構慣例

每個功能模組遵循以下路由結構：

```
/module              → 外殼 vue（router-view wrapper）
  /module            → index.vue（列表頁，role: "list"）
  /module/create     → create.vue（新增頁，role: "creat"）
  /module/:id        → [id].vue（詳細/編輯頁，role: "view"）
```

### 7.2 Route Meta 規範

每個子路由的 `meta` 必須包含：
- `name`：麵包屑顯示名稱
- `menu`：對應 `menuConfig.js` 中的選單名稱（用於權限控制）
- `role`：該頁面需要的最低權限（`list` / `creat` / `view`）
- `isRoute: false`：設定後，麵包屑項目不可點擊

---

## 八、SCSS 樣式規範

### 8.1 變數使用

使用 `_variables.scss` 中定義的全域變數（已自動注入，無需 import）：

```scss
.title {
  color: $primary;        // #792B1B 主色（深紅棕）
  color: $text-primary;   // #303133
  color: $text-light;     // #909399
  color: $gray;           // #7c7c7c
}
```

### 8.2 捲軸樣式

使用共用 mixin：

```scss
.some-container {
  @include scrollbar;
}
```

### 8.3 `<style>` 預設加 `scoped`

```vue
<style lang="scss" scoped>
/* 元件樣式 */
</style>
```

---

## 九、狀態顯示規範

### 9.1 使用 `useStatus` composable

狀態文字與對應 CSS class 透過 `useStatus` 統一處理：

```vue
<script setup>
import { useStatus } from "@/composables/useStatus";
</script>

<template>
  <span :class="useStatus(row.orderStatus, 'OrderStatus')">
    {{ row.orderStatus }}
  </span>
</template>
```

CSS class 對應：`green`（成功）/ `blue`（處理中）/ `red`（失敗）/ `secondary`（已取消）

---

## 十、金額格式化

使用全域 `$price` 方法格式化金額（千分位）：

```vue
<template>
  <span>{{ $price(row.price) }}</span>
</template>
```

---

## 十一、表單驗證規範

### 11.1 Rules 統一管理

驗證規則集中在 `src/plugins/rules.js`：

```js
// 引入對應頁面的規則
import { Product as rules } from "@/plugins/rules";

// 綁定到 el-form
<el-form :model="form" :rules="rules" ref="formRef">
```

### 11.2 表單提交驗證

```js
const handleSubmit = async () => {
  await formRef.value.validate();
  // 驗證通過後執行 API 呼叫
};
```

---

## 十二、命名慣例

| 類型 | 規則 | 範例 |
|---|---|---|
| 元件檔案 | PascalCase | `ProductDetail.vue` |
| 動態路由頁面 | `[id].vue` | `[id].vue` |
| API 模組 | camelCase | `product.js` |
| API 方法 | PascalCase | `Product.List()` |
| 響應式變數 | camelCase | `loading`, `formRef` |
| 事件 handler | `handle` 前綴 | `handleSubmit`, `handleDelete` |
| 初始化方法 | `init` 前綴 | `initProduct`, `initList` |
| CSS class | kebab-case | `product-item` |

---

## 十三、禁止事項

- **不使用** Options API（`data()`, `methods:`, `computed:`）
- **不直接** 在 template 中呼叫 API
- **不硬編碼** API Base URL（使用 `VITE_BASEURL` 環境變數）
- **不在** component 中直接操作 Cookie（透過 store 或 api/index.js 統一管理）
- **不省略** 分頁參數 `pageRequestParameter`（即使不分頁也需傳 `isReturnAllDataAndNoPage: true`）
