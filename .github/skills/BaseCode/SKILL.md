# SKILL — PackCredit BaseCode 開發風格指南

> 適用對象：資深軟體開發工程師
> 用途：理解本專案的 BaseCode 開發模式、慣例與可重用模板，確保新功能與既有程式碼風格一致

---

## 一、頁面模板

### 1.1 列表查詢頁（index.vue）

每個功能模組的列表頁遵循以下結構：

```vue
<script setup>
// ★ 新頁面不需要手動 import Vue API，由 unplugin-auto-import 自動注入
// ★ 如果舊頁面有手動 import，是舊寫法，新頁面不需要

import { SomeAPI } from "@/api/someApi";
import { useStatus } from "@/composables/useStatus";

const router = useRouter();
const loading = ref(false);

// 查詢表單
const form = reactive({
  fieldA: "",
  fieldB: null,
  dateRange: [],
  pageRequestParameter: {
    isReturnAllDataAndNoPage: false,
    targetPage: 1,
    showCount: 10,
  },
});

// 列表資料
const data = reactive({
  list: [],
  pagination: null,
});

// 初始化列表（命名規則：init + 功能名）
const initList = async () => {
  // 空值處理（送 API 前）
  if (!form.fieldB) form.fieldB = null;

  loading.value = true;
  try {
    const queryData = {
      ...form,
      fieldA: form.fieldA?.trim() || null,
      dateRange: form.dateRange?.length ? form.dateRange : null,
    };
    const res = await SomeAPI.List(queryData);
    data.list = res.data.data;
    data.pagination = res.data.pagination;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

// 重置表單
const handleReset = () => {
  Object.assign(form, {
    fieldA: "",
    fieldB: null,
    dateRange: [],
    pageRequestParameter: { isReturnAllDataAndNoPage: false, targetPage: 1, showCount: 10 },
  });
  initList();
};

// 分頁切換
const handlePageChange = (page) => {
  form.pageRequestParameter.targetPage = page;
  initList();
};

onMounted(() => {
  initList();
});
</script>

<template>
  <OutSideLayout>
    <!-- 搜尋區 -->
    <template #search>
      <PageTitle>功能名稱</PageTitle>
      <el-form :model="form" inline>
        <el-form-item label="欄位 A">
          <el-input v-model="form.fieldA" placeholder="請輸入" clearable />
        </el-form-item>
        <!-- 更多搜尋欄位 -->
        <el-form-item>
          <el-button type="primary" @click="initList" :loading="loading">查詢</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 結果區 -->
    <template #result>
      <SearchResultLayout>
        <!-- 操作按鈕區 -->
        <template #action>
          <el-button
            type="primary"
            v-if="$auth('功能名稱', 'creat')"
            @click="router.push('/module/create')"
          >新增</el-button>
        </template>

        <!-- 表格 -->
        <el-table :data="data.list" v-loading="loading" stripe>
          <el-table-column prop="fieldA" label="欄位 A" />
          <el-table-column label="狀態">
            <template #default="{ row }">
              <span :class="useStatus(row.status, 'PayTransactions')">
                {{ row.status }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="金額">
            <template #default="{ row }">
              {{ $price(row.amount) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="100">
            <template #default="{ row }">
              <el-button
                size="small"
                v-if="$auth('功能名稱', 'view')"
                @click="router.push(`/module/${row.id}`)"
              >查看</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分頁 -->
        <template #pagination>
          <Pagination
            :pagination="data.pagination"
            @change="handlePageChange"
          />
        </template>
      </SearchResultLayout>
    </template>
  </OutSideLayout>
</template>

<style lang="scss" scoped>
</style>
```

---

### 1.2 新增頁（create.vue）

```vue
<script setup>
import { SomeAPI } from "@/api/someApi";
import { SomeModule as rules } from "@/plugins/rules";

const router = useRouter();
const loading = ref(false);
const formRef = ref();

const form = reactive({
  name: "",
  subItemId: null,
  // ... 其他欄位
});

const handleSubmit = async () => {
  // 1. 表單驗證
  await formRef.value.validate();

  // 2. 防重複送出
  loading.value = true;
  try {
    await SomeAPI.Create(form);
    ElNotification({ title: "系統提示", message: "新增成功", type: "success" });
    router.back();
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};
</script>

<template>
  <InSideLayout
    click1="取消"
    click2="確認新增"
    :loading="loading"
    @back="router.back()"
    @click1="router.back()"
    @click2="handleSubmit"
  >
    <template #title>新增功能名稱</template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="名稱" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <!-- 更多欄位 -->
    </el-form>
  </InSideLayout>
</template>

<style lang="scss" scoped>
</style>
```

---

### 1.3 詳細/編輯頁（[id].vue）

```vue
<script setup>
import { SomeAPI } from "@/api/someApi";
import { SomeModule as rules } from "@/plugins/rules";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const formRef = ref();

const form = reactive({
  name: "",
  // ...
});

// 初始化資料
const initData = async () => {
  loading.value = true;
  try {
    const res = await SomeAPI.GetById(route.params.id);
    Object.assign(form, res.data);
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleSubmit = async () => {
  await formRef.value.validate();
  loading.value = true;
  try {
    await SomeAPI.Update(route.params.id, form);
    ElNotification({ title: "系統提示", message: "更新成功", type: "success" });
    router.back();
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

const handleDelete = async () => {
  await ElMessageBox.confirm("確定要刪除嗎？", "系統提示", {
    confirmButtonText: "確認",
    cancelButtonText: "取消",
    type: "warning",
  });
  loading.value = true;
  try {
    await SomeAPI.Delete(route.params.id);
    ElNotification({ title: "系統提示", message: "刪除成功", type: "success" });
    router.back();
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

onMounted(() => {
  initData();
});
</script>

<template>
  <InSideLayout
    click1="取消"
    click2="儲存"
    click3="刪除"
    :loading="loading"
    @back="router.back()"
    @click1="router.back()"
    @click2="handleSubmit"
    @click3="handleDelete"
  >
    <template #title>編輯功能名稱</template>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" v-loading="loading">
      <el-form-item label="名稱" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
    </el-form>
  </InSideLayout>
</template>

<style lang="scss" scoped>
</style>
```

---

### 1.4 殼層頁（module.vue）

每個功能模組的外殼頁固定格式：

```vue
<template>
  <router-view v-slot="{ Component }">
    <component :is="Component" />
  </router-view>
</template>

<style lang="scss" scoped></style>
```

---

## 二、API 模組模板

### 2.1 標準模組格式

```js
// src/api/someModule.js
import request from "./index";

export const SomeModule = {
  // 列表查詢（POST，含分頁）
  List: (data) => request.post("/SomeModule/List", data),

  // 取單筆（GET）
  GetById: (id) => request.get(`/SomeModule/${id}`),

  // 新增（POST）
  Create: (data) => request.post("/SomeModule", data),

  // 更新（PUT）
  Update: (id, data) => request.put(`/SomeModule/${id}`, data),

  // 刪除（DELETE）
  Delete: (id) => request.delete(`/SomeModule/${id}`),
};
```

---

## 三、Select 元件模板

### 3.1 標準 Select 元件格式

```vue
<!-- src/components/select/SelectSomething.vue -->
<script setup>
import { SomeAPI } from "@/api/someApi";

const props = defineProps({
  modelValue: [Number, String],       // 綁定值（通常是 ID）
  disabled: Boolean,
  placeholder: {
    type: String,
    default: "請選擇項目",
  },
});

const emits = defineEmits(["update:modelValue", "select"]);
const loading = ref(false);
const data = reactive({ list: [] });

const initList = async () => {
  loading.value = true;
  try {
    const res = await SomeAPI.SelectList({
      pageRequestParameter: {
        isReturnAllDataAndNoPage: true,
        targetPage: 0,
        showCount: 0,
      },
    });
    data.list = res.data.data;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

onMounted(() => {
  initList();
});
</script>

<template>
  <el-select
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    clearable
  >
    <el-option
      v-for="item in data.list"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    />
  </el-select>
</template>
```

---

## 四、路由模板

### 4.1 新增功能模組的路由設定

```js
// 在 router/index.js 的 children 陣列中新增
{
  path: "/newModule",
  component: () => import("../views/main/newModule.vue"),  // 殼層頁
  meta: {
    name: "新功能名稱",
    isRoute: false,  // 麵包屑父層不可點擊
  },
  children: [
    {
      path: "",
      component: () => import("../views/main/newModule/index.vue"),
      meta: {
        name: "新功能名稱",
        menu: "新功能名稱",   // 對應 menuConfig.js 的名稱
        role: "list",
      },
    },
    {
      path: "/newModule/create",
      component: () => import("../views/main/newModule/create.vue"),
      meta: {
        name: "新增項目",
        menu: "新功能名稱",
        role: "creat",
      },
    },
    {
      path: "/newModule/:id",
      component: () => import("../views/main/newModule/[id].vue"),
      meta: {
        name: "編輯項目",
        menu: "新功能名稱",
        role: "view",
      },
    },
  ],
},
```

### 4.2 同時更新 menuConfig.js

```js
// src/utils/menuConfig.js
export const allMenuNames = [
  // ...既有項目
  '新功能名稱',   // ← 新增這一行
];
```

---

## 五、表單驗證規範

### 5.1 rules.js 新增規則

```js
// src/plugins/rules.js

// 新增模組的驗證規則（模組名稱對應 API 模組）
export const NewModule = {
  name: [Required()],
  amount: [RequiredNumber()],
  subItemId: [Required()],
};
```

---

## 六、程式碼慣例

### 6.1 命名規則彙總

| 類型 | 命名規則 | 範例 |
|---|---|---|
| Vue 元件檔 | PascalCase | `PayBillDetail.vue` |
| 動態路由頁 | `[id].vue` | `[id].vue` |
| API 模組檔 | camelCase | `payBill.js` |
| API 方法名 | PascalCase | `PayBill.List()` |
| `ref` 變數 | camelCase | `loading`, `formRef` |
| `reactive` 變數 | camelCase | `form`, `data` |
| 事件 handler | `handle` 前綴 | `handleSubmit` |
| 初始化函式 | `init` 前綴 | `initPayBill` |
| CSS class | kebab-case | `pay-bill-item` |

### 6.2 狀態顯示

```vue
<!-- 使用 useStatus composable，不要用 if/else 硬寫 class -->
<span :class="useStatus(row.status, 'PayTransactions')">
  {{ row.status }}
</span>
```

```scss
// 狀態 CSS class（已全域定義）
.green     { color: #67c23a; }
.blue      { color: #409eff; }
.red       { color: #f56c6c; }
.secondary { color: #909399; }
```

### 6.3 金額顯示

```vue
<!-- 使用全域 $price，不要自行實作千分位 -->
{{ $price(row.amount) }}
```

### 6.4 日期處理

統一使用 `dayjs`，不使用原生 Date 物件直接操作：

```js
import dayjs from "dayjs";

// 取今天
dayjs().format("YYYY-MM-DD")

// 7天前
dayjs().add(-7, "days").format("YYYY-MM-DD")

// 顯示日期時間
dayjs(row.createDate).format("YYYY/MM/DD HH:mm")
```

### 6.5 空值處理原則

API 送出前必須統一空值：

```js
const queryData = {
  ...form,
  // 字串 → 空時轉 null
  name: form.name?.trim() || null,
  // 數字 → 0 或空時轉 null
  amount: form.amount || null,
  // 日期區間陣列 → 空陣列轉 null
  dateRange: form.dateRange?.length ? form.dateRange : null,
  // 選單 ID → 0 轉 null
  subItemId: form.subItemId || null,
};
```

### 6.6 console.log 保留策略

開發中保留 `console.log`，以 `try/catch` 中的錯誤輸出為主：

```js
try {
  const res = await SomeAPI.List(form);
  console.log("SomeAPI.List", res);  // 開發用，可保留
  // ...
} catch (error) {
  console.log(error);  // 錯誤輸出必須保留
}
```

---

## 七、常見錯誤防範

### 7.1 `$auth` 在 `<script setup>` 中的用法

`$auth` 為全域 property，在 `<template>` 中直接用，在 `<script setup>` 中需透過 `proxy` 存取：

```js
// ✅ 正確
const instance = getCurrentInstance();
const $auth = instance?.proxy?.$auth;
if ($auth('功能名稱', 'delete')) { ... }

// ❌ 錯誤（$auth 在 script 中無法直接存取）
if ($auth('功能名稱', 'delete')) { ... }
```

### 7.2 分頁參數不可省略

即使是不需分頁的查詢（如 Select 清單），仍需傳入 `pageRequestParameter`：

```js
// ✅ 不分頁查詢
{
  pageRequestParameter: {
    isReturnAllDataAndNoPage: true,
    targetPage: 0,
    showCount: 0,
  }
}

// ❌ 不可省略 pageRequestParameter
{}
```

### 7.3 reactive 物件的重置

不可直接賦值替換 reactive 物件，需用 `Object.assign`：

```js
// ✅ 正確
Object.assign(form, { name: "", amount: null });

// ❌ 錯誤（會失去響應性）
form = { name: "", amount: null };
```

### 7.4 loading 的非同步安全寫法

`loading.value = false` 要放在 `try/catch` 之外，確保不論成功失敗都會解除：

```js
// ✅ 正確
const initList = async () => {
  loading.value = true;
  try {
    // ...
  } catch (error) {
    console.log(error);
  }
  loading.value = false;  // ← 放在 try/catch 外面
};
```

---

## 八、SCSS 風格規範

### 8.1 全域 SCSS 變數（自動注入，無需 @import）

```scss
// 顏色變數
$primary: #792B1B;        // 主色
$yellow: #deb317;
$gray: #7c7c7c;
$text-primary: #303133;
$text-light: #909399;
$text-placeholder: #979797;

// 滾動條 Mixin
@mixin scrollbar { ... }
```

### 8.2 Element Plus 主題覆蓋

全域 Element Plus 樣式覆蓋放在 `src/assets/scss/element/` 目錄下，勿在元件內覆蓋 Element Plus 樣式。

---

## 九、新功能開發清單

開發一個新的 CRUD 功能模組時，依序完成以下項目：

- [ ] 在 `src/api/` 新增 API 模組（參考 § 二）
- [ ] 在 `src/plugins/rules.js` 新增表單驗證規則（參考 § 五）
- [ ] 在 `src/utils/menuConfig.js` 新增選單名稱
- [ ] 在 `src/router/index.js` 新增路由定義（參考 § 四）
- [ ] 新增殼層頁 `views/main/newModule.vue`（參考 § 一.4）
- [ ] 新增列表頁 `views/main/newModule/index.vue`（參考 § 一.1）
- [ ] 新增新增頁 `views/main/newModule/create.vue`（參考 § 一.2）
- [ ] 新增詳細/編輯頁 `views/main/newModule/[id].vue`（參考 § 一.3）
- [ ] 在 `src/components/global/MainMenu.vue` 新增選單項目
- [ ] 若有下拉選單需求，新增 `src/components/select/SelectNewModule.vue`（參考 § 三）
