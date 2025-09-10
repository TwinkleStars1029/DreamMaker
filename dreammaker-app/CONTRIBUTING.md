# 🤝 貢獻指南

感謝你對 DreamMaker 的興趣！我們歡迎各種形式的貢獻，包括但不限於：

- 🐛 回報 Bug
- ✨ 新功能建議
- 📝 文件改進
- 🔧 程式碼優化
- 🎨 UI/UX 改進

## 📋 貢獻流程

### 1. Fork 專案
1. 點擊 GitHub 頁面上的 "Fork" 按鈕
2. 將你的 Fork 克隆到本地：
```bash
git clone https://github.com/your-username/dreammaker.git
cd dreammaker
```

### 2. 設定開發環境
```bash
# 進入應用程式目錄
cd dreammaker-app

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 3. 建立功能分支
```bash
# 從 main 分支建立新分支
git checkout -b feature/amazing-feature

# 或修復 Bug
git checkout -b fix/bug-description
```

### 4. 進行開發
- 遵循現有的程式碼風格
- 確保程式碼通過所有測試
- 更新相關文件

### 5. 提交變更
```bash
# 添加變更
git add .

# 提交（使用語義化提交訊息）
git commit -m "feat: add new role creation feature"

# 推送到你的 Fork
git push origin feature/amazing-feature
```

### 6. 建立 Pull Request
1. 前往你的 Fork 頁面
2. 點擊 "New Pull Request"
3. 填寫 PR 描述
4. 等待審查

## 📝 提交訊息規範

我們使用 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

### 格式
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 類型
- `feat`: 新功能
- `fix`: Bug 修復
- `docs`: 文件變更
- `style`: 程式碼格式（不影響功能）
- `refactor`: 重構
- `perf`: 效能優化
- `test`: 測試相關
- `chore`: 建置過程或輔助工具的變動

### 範例
```bash
feat(role): add role version management
fix(conversation): resolve message display issue
docs: update deployment guide
style: format code with prettier
```

## 🎨 程式碼風格

### TypeScript/JavaScript
- 使用 2 個空格縮排
- 使用單引號
- 行尾不加分號
- 使用 `const` 和 `let`，避免 `var`
- 函數和變數使用 camelCase
- 類別使用 PascalCase

### Vue 元件
```vue
<template>
  <div class="component-name">
    <!-- 使用 kebab-case 的 CSS 類別 -->
  </div>
</template>

<script setup lang="ts">
// 使用 Composition API
import { ref, computed } from 'vue'

// 定義 props 和 emits
interface Props {
  title: string
  description?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [value: string]
}>()

// 響應式資料
const isVisible = ref(false)

// 計算屬性
const displayTitle = computed(() => props.title.toUpperCase())
</script>

<style scoped>
.component-name {
  /* 使用 CSS 變數 */
  color: var(--text-color);
}
</style>
```

### CSS
- 使用 CSS 變數定義顏色和間距
- 優先使用 Tailwind CSS 類別
- 自訂樣式使用 BEM 命名法
- 響應式設計優先

## 🧪 測試

### 執行測試
```bash
# 執行所有測試
npm test

# 監聽模式
npm run test:watch

# 覆蓋率報告
npm run test:coverage
```

### 撰寫測試
```typescript
// 元件測試範例
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ModuleManager from '@/components/ModuleManager.vue'

describe('ModuleManager', () => {
  it('renders module list correctly', () => {
    const wrapper = mount(ModuleManager, {
      props: {
        modules: [
          { id: '1', name: 'Test Module', type: 'basic' }
        ]
      }
    })
    
    expect(wrapper.find('.module-list').exists()).toBe(true)
  })
})
```

## 📚 文件撰寫

### README 更新
- 保持 README.md 簡潔明瞭
- 包含安裝和使用說明
- 提供清楚的範例

### 程式碼註解
```typescript
/**
 * 建立新的 AI 角色
 * @param roleData - 角色資料
 * @param modules - 選中的模組列表
 * @returns 建立的角色物件
 */
export async function createRole(
  roleData: RoleData,
  modules: Module[]
): Promise<Role> {
  // 實作邏輯
}
```

### API 文件
- 使用 JSDoc 註解
- 提供參數和回傳值說明
- 包含使用範例

## 🐛 回報 Bug

### 使用 Issue 模板
1. 前往 Issues 頁面
2. 點擊 "New Issue"
3. 選擇 "Bug Report" 模板
4. 填寫詳細資訊

### 包含資訊
- 作業系統和瀏覽器版本
- 重現步驟
- 預期行為
- 實際行為
- 錯誤截圖或日誌

## ✨ 功能建議

### 使用 Feature Request 模板
1. 前往 Issues 頁面
2. 點擊 "New Issue"
3. 選擇 "Feature Request" 模板
4. 詳細描述你的想法

### 包含資訊
- 功能描述
- 使用場景
- 預期效果
- 可能的實作方式

## 🔍 程式碼審查

### 審查清單
- [ ] 程式碼符合專案風格
- [ ] 包含適當的測試
- [ ] 文件已更新
- [ ] 沒有破壞性變更
- [ ] 效能影響已考慮

### 審查流程
1. 自動化檢查（CI/CD）
2. 維護者審查
3. 必要時要求修改
4. 審查通過後合併

## 🏷️ 標籤系統

### Issue 標籤
- `bug`: Bug 回報
- `enhancement`: 功能改進
- `documentation`: 文件相關
- `good first issue`: 適合新手的問題
- `help wanted`: 需要幫助
- `priority: high`: 高優先級
- `priority: medium`: 中優先級
- `priority: low`: 低優先級

### PR 標籤
- `ready for review`: 準備審查
- `needs changes`: 需要修改
- `approved`: 已批准
- `breaking change`: 破壞性變更

## 🎯 開發重點

### 目前優先級
1. 模型比較面板
2. Google Sheets 同步
3. 效能優化
4. 測試覆蓋率提升
5. 文件完善

### 技術債務
- 重構舊的元件結構
- 改善錯誤處理
- 優化載入效能
- 增強可訪問性

## 📞 聯絡方式

- 主要維護者：[Your Name]
- 電子郵件：[your-email@example.com]
- GitHub：[@your-username]
- Discord：[Discord 伺服器連結]

## 📄 授權

本專案採用 MIT 授權條款。貢獻即表示你同意你的程式碼將在相同的授權條款下發布。

---

**感謝你的貢獻，讓我們一起讓 DreamMaker 變得更好！** ✨
