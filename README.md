# PackCredit

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## API Gateway 設定

瀏覽器固定呼叫同源 `/api`，API Key 只能由 Vite 開發代理或正式 Nginx 注入，不能放在 `VITE_*` 變數或 Vue 程式碼中。

本機開發：

1. 將 `.env.local.example` 複製為 `.env.local`。
2. 設定 `PACKCREDIT_API_UPSTREAM` 與目前有效的 `PACKCREDIT_API_KEY`。
3. 啟動 `PackCreditmanagement` 後執行 `npm run dev`。

Docker／Nginx：

```text
PACKCREDIT_API_UPSTREAM=http://packcreditmanagement:8080
PACKCREDIT_CLIENT_ID=packcredit-web-gateway
PACKCREDIT_API_KEY=<由部署平台 Secret 注入>
```

`PACKCREDIT_API_UPSTREAM` 不要在結尾加 `/`，以保留後端 `/api/...` 路徑。Nginx 會在容器啟動時由 `nginx.conf` template 產生正式設定，API Key 不會進入前端映像檔。
