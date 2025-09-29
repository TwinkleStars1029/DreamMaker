# DreamMaker App

一個用於設計、管理和測試 AI 角色及對話流程的 Web 應用程式。

## ✨ 主要功能

-   **角色編輯器**: 提供一個介面來組合和設定 AI 角色的不同模組（如背景、個性、指令等）。
-   **對話測試器**: 即時測試 AI 角色的對話表現。
-   **模組管理**: 集中管理和編輯構成角色的各個內容模組。
-   **匯入/匯出**: 支援將角色和對話資料匯出成 CSV 或 JSON 格式，也支援從檔案匯入。
-   **設定**: 提供應用程式的相關設定選項。

## 🛠️ 使用技術

-   **前端框架**: [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
-   **程式語言**: [TypeScript](https://www.typescriptlang.org/)
-   **狀態管理**: [Pinia](https://pinia.vuejs.org/)
-   **UI 框架**: [Tailwind CSS](https://tailwindcss.com/)
-   **本地端資料庫**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
-   **測試工具**: [Vitest](https://vitest.dev/)

## 🚀 快速上手

請依照以下步驟在您的本機環境中啟動專案。

**1. 環境準備**

-   確認已安裝 [Node.js](https://nodejs.org/) (建議版本 18.x 或以上)
-   推薦使用 [pnpm](https://pnpm.io/installation) 作為套件管理器

**2. 複製專案**

```bash
git clone https://github.com/your-username/dreammaker-app.git
cd dreammaker-app
```

**3. 安裝依賴**

```bash
npm install
# 或 yarn install
# 或 pnpm install
```

**4. 環境變數**

複製 `env.example` 檔案並重新命名為 `.env`，然後填入必要的環境變數（例如 API 金鑰）。

```bash
cp env.example .env
```

**5. 啟動開發伺服器**

```bash
npm run dev
```

應用程式將會在 `http://localhost:5173` (或 Vite 指定的埠號) 上運行。

## 📜 可用的指令腳本

在 `package.json` 中定義了多個指令腳本，方便開發與部署：

| 指令                | 描述                                               |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | 啟動開發伺服器                                     |
| `npm run build`     | 建置生產版本的應用程式                             |
| `npm run preview`   | 在本地預覽生產版本                                 |
| `npm run test`      | 執行單元測試                                       |
| `npm run lint`      | 檢查並修正程式碼風格                               |
| `npm run format`    | 使用 Prettier 格式化所有檔案                       |
| `npm run type-check`| 執行 TypeScript 類型檢查                           |

## 部署

本專案已預設多種部署設定：

-   **GitHub Pages**: 執行 `npm run deploy`。
-   **Vercel**: 執行 `npm run deploy:vercel`。
-   **Netlify**: 執行 `npm run deploy:netlify`。
-   **Docker**:
    -   `npm run docker:build`: 建置 Docker image。
    -   `npm run docker:run`: 執行 Docker container。
    -   `npm run docker:compose`: 使用 Docker Compose 啟動服務。

## 🤝 貢獻

歡迎您為這個專案做出貢獻！請參考 `CONTRIBUTING.md` 檔案以了解更多細節。

## 📄 授權

本專案採用 `LICENSE` 中指定的授權條款。