import { createRouter, createWebHistory } from "vue-router";
import Cookies from "js-cookie";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 公開首頁
    {
      path: "/",
      component: () => import("../views/public/home.vue"),
      meta: { name: "首頁" },
    },
    // 登入頁
    {
      path: "/login",
      component: () => import("../views/public/login.vue"),
      meta: { name: "登入" },
    },
    // 會員註冊頁
    {
      path: "/register",
      component: () => import("../views/public/register.vue"),
      meta: { name: "會員註冊" },
    },
    // 忘記密碼頁
    {
      path: "/forgot-password",
      component: () => import("../views/public/forgot-password.vue"),
      meta: { name: "忘記密碼" },
    },
    // 前台動態選單內容頁
    {
      path: "/content/:pcKey",
      name: "PortalContent",
      component: () => import("../views/public/portal-content.vue"),
      meta: { name: "前台選單內容" },
    },
    // 最新消息列表
    {
      path: "/news",
      name: "NewsList",
      component: () => import("../views/public/news-list.vue"),
      meta: { name: "最新消息" },
    },
    // 最新消息內容
    {
      path: "/news/:newsId",
      name: "NewsDetail",
      component: () => import("../views/public/news-detail.vue"),
      meta: { name: "最新消息內容" },
    },
    // 後台管理區域
    {
      path: "/app",
      component: () => import("../views/index.vue"),
      meta: {
        name: "商品瀏覽",
      },
      children: [
        {
          path: "",
          component: () => import("../views/main/home.vue"),
        },

        // 公司 Q&A
        {
          path: "/qa",
          name: "CompanyQa",
          component: () => import("../views/main/qa.vue"),
          meta: {
            name: "公司 Q&A",
            requireAuth: true,
          },
        },

        // 個人及企業資料（唯讀）
        {
          path: "/profile",
          name: "MemberProfile",
          component: () => import("../views/main/profile.vue"),
          meta: {
            name: "個人及企業資料",
            requireAuth: true,
          },
        },

        // 公司聯絡人帳號（公司管理者）
        {
          path: "/company-members",
          name: "CompanyMembers",
          component: () => import("../views/main/company-members.vue"),
          meta: {
            name: "公司聯絡人帳號",
            requireAuth: true,
          },
        },

        // 公司儲值／首次開通
        {
          path: "/top-up",
          name: "TopUp",
          component: () => import("../views/main/top-up.vue"),
          meta: {
            name: "公司儲值",
            requireAuth: true,
          },
        },

        // 商品分類管理
        {
          path: "/productCategory",
          component: () => import("../views/main/productCategory.vue"),
          meta: {
            name: "商品分類管理",
            isRoute: false,
            requireAuth: true,
          },
          children: [
            {
              path: "",
              component: () => import("../views/main/productCategory/index.vue"),
              meta: {
                name: "商品分類管理",
                menu: "商品分類管理",
                role: "list",
              },
            },
            {
              path: "/productCategory/create",
              component: () => import("../views/main/productCategory/create.vue"),
              meta: {
                name: "新增商品分類",
                menu: "商品分類管理",
                role: "creat",
              },
            },
            {
              path: "/productCategory/:id",
              component: () => import("../views/main/productCategory/[id].vue"),
              meta: {
                name: "編輯商品分類",
                menu: "商品分類管理",
                role: "view",
              },
            },
          ],
        },

        // 商品管理
        {
          path: "/product",
          component: () => import("../views/main/product.vue"),
          meta: {
            name: "商品管理",
            isRoute: false,
            requireAuth: true,
          },
          children: [
            {
              path: "",
              component: () => import("../views/main/product/index.vue"),
              meta: {
                name: "商品管理",
                menu: "商品管理",
                role: "list",
              },
            },
            {
              path: "/product/create",
              component: () => import("../views/main/product/create.vue"),
              meta: {
                name: "新增商品",
                menu: "商品管理",
                role: "creat",
              },
            },
            {
              path: "/product/:id",
              component: () => import("../views/main/product/[id].vue"),
              meta: {
                name: "編輯商品",
                menu: "商品管理",
                role: "view",
              },
            },
          ],
        },

        // 訂單管理
        {
          path: "/order",
          component: () => import("../views/main/order.vue"),
          meta: {
            name: "訂單管理",
            isRoute: false,
            requireAuth: true,
          },
          children: [
            {
              path: "",
              component: () => import("../views/main/order/index.vue"),
              meta: {
                name: "訂單管理",
                menu: "訂單管理",
                role: "list",
              },
            },
            {
              path: "/order/:id",
              component: () => import("../views/main/order/[id].vue"),
              meta: {
                name: "訂單詳細",
                menu: "訂單管理",
                role: "view",
              },
            },
          ],
        },

        // 會員管理
        {
          path: "/member",
          component: () => import("../views/main/member.vue"),
          meta: {
            name: "會員管理",
            isRoute: false,
            requireAuth: true,
          },
          children: [
            {
              path: "",
              component: () => import("../views/main/member/index.vue"),
              meta: {
                name: "會員管理",
                menu: "會員管理",
                role: "list",
              },
            },
            {
              path: "/member/:id",
              component: () => import("../views/main/member/[id].vue"),
              meta: {
                name: "會員詳細",
                menu: "會員管理",
                role: "view",
              },
            },
          ],
        },
      ],
    },

    // 舊版入口導向（向後相容）
    {
      path: "/admin",
      redirect: "/login",
    },

    // 404
    {
      path: "/:pathMatch(.*)*",
      name: "ErrorView",
      component: () => import("../views/404.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const admin = Cookies.get("hsinchupay-admin");
  const token = admin ? JSON.parse(admin).token : "";
  const roles = JSON.parse(localStorage.getItem("hsinchupay-role")) || [];

  if (to.matched.some((m) => m.meta.requireAuth)) {
    if (!token) {
      ElMessage.error("請重新登入");
      next("/login");
    } else {
      const menu = roles.find((menu) => menu.menuName === to.meta.menu);
      if (menu && !menu.role.view) {
        ElMessage.error("您目前沒有權限");
        next("/");
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
