# ✨ DreamMaker - AI 角色扮演平台

一個輕量級的 AI 角色扮演平台，讓使用者模組化地建立角色（性格、背景、提示詞），並應用於 AI 模型 API 進行角色扮演。

## 🌟 功能特色

### 🧩 模組化角色設計
- **基本資訊模組**：角色名稱、描述、頭像
- **性格特徵模組**：個性特點、語氣風格、行為模式
- **背景故事模組**：角色歷史、世界觀、關係網
- **行為指令模組**：特殊指令、限制條件、互動規則
- **事件故事模組**：角色事件故事
- **多版本管理**：每個模組支援多個版本，可自由切換

### 🔧 角色拼裝工具
- **視覺化拖曳介面**：直觀的模組組合方式
- **即時預覽**：即時查看角色組合效果
- **版本快照**：保存不同時期的角色配置
- **一鍵複製**：快速建立相似角色

### 💬 對話測試系統
- **多模型支援**：OpenAI、Gemini、Azure OpenAI
- **即時對話**：與 AI 角色進行真實對話
- **參數調整**：溫度、最大長度等參數即時調整
- **對話歷史**：保存和管理對話記錄


### 📊 資料管理
- **匯入/匯出**：JSON/CSV 格式支援
- **資料驗證**：確保資料完整性和格式正確
- **Google Sheets 同步**：雙向同步到 Google 試算表
- **備份還原**：完整的資料備份機制

## 🚀 快速開始

### 環境需求
- Node.js 18+ 
- npm 或 yarn
- 現代瀏覽器（Chrome、Firefox、Safari、Edge）

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/your-username/dreammaker.git
cd dreammaker
```

2. **安裝依賴**
```bash
npm install
```

3. **啟動開發伺服器**
```bash
npm run dev
```

4. **開啟瀏覽器**
訪問 `http://localhost:5173`

### 建置生產版本
```bash
npm run build
```

## 🛠️ 技術架構

### 前端技術棧
- **Vue 3** - 響應式框架
- **TypeScript** - 型別安全
- **Vite** - 快速建置工具
- **Tailwind CSS** - 原子化 CSS 框架
- **Pinia** - 狀態管理
- **Dexie** - IndexedDB 封裝

### AI 整合
- **OpenAI API** - GPT 系列模型
- **Google Gemini API** - Gemini 系列模型
- **Azure OpenAI** - 企業級 AI 服務
- **抽象層設計** - 統一的 AI 服務介面

### 資料儲存
- **LocalStorage** - 設定和暫存資料
- **IndexedDB** - 大量資料持久化
- **Google Sheets API** - 雲端同步

## 📁 專案結構

```
dreammaker-app/
├── public/                 # 靜態資源
├── src/
│   ├── components/         # Vue 元件
│   │   ├── ModuleManager.vue      # 模組管理
│   │   ├── RoleAssembler.vue      # 角色拼裝
│   │   ├── ConversationTester.vue # 對話測試
│   │   └── Settings.vue           # 設定頁面
│   ├── services/           # 服務層
│   │   ├── aiService.ts           # AI 服務抽象層
│   │   └── storageService.ts      # 儲存服務
│   ├── stores/             # Pinia 狀態管理
│   │   └── index.ts
│   ├── types/              # TypeScript 型別定義
│   │   └── index.ts
│   ├── utils/              # 工具函數
│   ├── App.vue             # 根元件
│   ├── main.ts             # 入口檔案
│   └── style.css           # 全域樣式
├── package.json
├── vite.config.ts
└── README.md
```

## 🎨 設計系統

### 色彩主題
- **主色調**：溫暖的藍灰色系 (#D8E3E7)
- **強調色**：柔和的橙色 (#E8C099)
- **按鈕色**：溫暖的珊瑚色 (#F2AA84)
- **文字色**：中性灰色 (#747474)

### 設計原則
- **溫暖柔和**：使用圓角設計和柔和色彩
- **現代簡約**：清晰的視覺層次和簡潔的介面
- **響應式**：適配各種裝置尺寸
- **可訪問性**：支援鍵盤導航和螢幕閱讀器

## 🔧 開發指南

### 新增 AI 供應商
1. 在 `src/services/aiService.ts` 中實作 `AiProvider` 介面
2. 在 `AiService` 類別中註冊新的供應商
3. 更新 `getSupportedModels` 方法

### 新增模組類型
1. 在 `src/types/index.ts` 中定義新的模組型別
2. 在 `ModuleManager.vue` 中新增對應的 UI
3. 更新 `RoleAssembler.vue` 的拼裝邏輯

### 自訂主題
修改 `src/style.css` 中的 CSS 變數：
```css
:root {
  --primary-color: #your-color;
  --accent-color: #your-accent;
  /* ... 其他變數 */
}
```

## 📦 部署

### GitHub Pages
1. 建置專案：`npm run build`
2. 推送到 GitHub
3. 在 Repository 設定中啟用 GitHub Pages
4. 選擇 `gh-pages` 分支作為來源

### Cloudflare Pages
1. 連接 GitHub Repository
2. 設定建置命令：`npm run build`
3. 設定輸出目錄：`dist`
4. 部署

### Vercel
1. 連接 GitHub Repository
2. 自動偵測 Vue 專案
3. 設定環境變數（如需要）
4. 部署

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 提交變更：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 建立 Pull Request

## 📄 授權條款

本專案採用 MIT 授權條款。詳見 [LICENSE](LICENSE) 檔案。

## 🙏 致謝

- Vue.js 團隊提供的優秀框架
- Tailwind CSS 的設計系統
- 所有開源貢獻者的努力

## 📞 聯絡資訊

- 專案維護者：[Esther1oo]
- 電子郵件：[your-email@example.com]
- GitHub：[@your-username]

## 模組拚裝模板（Step 3）

- 角色建立流程新增第 3 步「模組拚裝」，第 4 步為「預覽」。
- 模板編輯器提供：
  - 佔位符插入按鈕、重設為預設模板
  - 右側即時預覽（依目前勾選的模組 + 當前模板渲染）
- 支援佔位符（Placeholders）：
  - [角色基本資訊] 或 [BASIC]
  - [性格特徵] 或 [PERSONA]
  - [語氣特點] 或 [TONE]
  - [背景故事] 或 [BACKGROUND]
  - [事件] 或 [EVENT]
  - [行為指令] 或 [INSTRUCTION]

範例模板：

```
# 任務
請參考此份角色設定，扮演角色與我對話

# 角色設定
## 角色基本資訊
[角色基本資訊]
## 性格特徵
[性格特徵]
[語氣特點]
## 背景故事
[背景故事]
## 事件
[事件]
## 行為指令
[行為指令]
```

資料儲存與解析：
- Role.notes 首行會寫入：`模組拼裝: <id1,id2,...>`（解析僅讀至換行，避免模板干擾）
- 若有自訂模板，notes 會在後段附上「模組拚裝模板:」後接多行模板
- 另把模板同步存到 `role.assemblyTemplate` 以便讀取

ConversationTester 組裝邏輯：
- 優先使用 notes 內的「模組拚裝模板:」/「模組拼裝模板:」
- 否則使用 `role.assemblyTemplate`
- 若皆無，回退以模組類型逐段組裝（與舊版一致）

---

**DreamMaker** - 讓 AI 角色扮演變得簡單而有趣！ ✨

