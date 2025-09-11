# 🚀 DreamMaker 部署指南

本文件詳細說明如何將 DreamMaker 部署到各種平台。

## 📋 部署前準備

### 1. 環境檢查
確保你的開發環境已安裝：
- Node.js 18.0 或更高版本
- npm 8.0 或更高版本
- Git

### 2. 建置專案
```bash
# 安裝依賴
npm install

# 建置生產版本
npm run build

# 預覽建置結果
npm run preview
```

### 3. 環境變數設定
建立 `.env.production` 檔案（如需要）：
```env
VITE_APP_TITLE=DreamMaker
VITE_APP_VERSION=1.0.0
VITE_APP_API_BASE_URL=https://api.dreammaker.com
```

## 🌐 GitHub Pages 部署

### 方法一：使用 GitHub Actions（推薦）

1. **建立 GitHub Actions 工作流程**
   在 `.github/workflows/deploy.yml` 建立檔案：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

2. **設定 GitHub Pages**
   - 前往 Repository 的 Settings
   - 找到 Pages 區段
   - 選擇 Source: "GitHub Actions"
   - 儲存設定

3. **推送程式碼**
```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

### 方法二：手動部署

1. **安裝 gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **修改 package.json**
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

3. **部署**
```bash
npm run build
npm run deploy
```

## ☁️ Cloudflare Pages 部署

### 1. 連接 GitHub Repository

1. 登入 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 點擊 "Create a project"
3. 選擇 "Connect to Git"
4. 授權並選擇你的 GitHub Repository

### 2. 設定建置參數

- **Framework preset**: Vue
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `dreammaker-app` (如果專案在子目錄)

### 3. 環境變數（可選）

在 Pages 設定中新增環境變數：
- `NODE_VERSION`: `18`
- `NPM_VERSION`: `8`

### 4. 自訂網域（可選）

1. 在 Pages 專案設定中點擊 "Custom domains"
2. 新增你的網域
3. 按照指示設定 DNS 記錄

## 🔥 Vercel 部署

### 1. 安裝 Vercel CLI
```bash
npm i -g vercel
```

### 2. 部署
```bash
# 在專案根目錄執行
vercel

# 或指定子目錄
vercel --cwd dreammaker-app
```

### 3. 自動部署設定

建立 `vercel.json` 檔案：
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🌊 Netlify 部署

### 1. 手動部署
1. 建置專案：`npm run build`
2. 將 `dist` 資料夾拖拽到 [Netlify Drop](https://app.netlify.com/drop)

### 2. Git 整合部署
1. 連接 GitHub Repository
2. 設定建置命令：`npm run build`
3. 設定發布目錄：`dist`
4. 部署

### 3. 自訂網域
1. 在 Site settings 中點擊 "Domain management"
2. 新增自訂網域
3. 設定 DNS 記錄

## 🐳 Docker 部署

### 1. 建立 Dockerfile
```dockerfile
# 多階段建置
FROM node:18-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 生產階段
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 建立 nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 3. 建置和執行
```bash
# 建置映像檔
docker build -t dreammaker .

# 執行容器
docker run -p 80:80 dreammaker
```

## 🔧 部署後設定

### 1. 設定 HTTPS
大多數平台都自動提供 HTTPS，但自託管需要額外設定：

```nginx
server {
    listen 443 ssl;
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    # ... 其他設定
}
```

### 2. 設定快取策略
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
    add_header Cache-Control "no-cache";
}
```

### 3. 設定壓縮
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## 🚨 故障排除

### 常見問題

1. **路由問題**
   - 確保設定 SPA 路由重寫
   - 檢查 `try_files` 設定

2. **建置失敗**
   - 檢查 Node.js 版本
   - 清除 node_modules 重新安裝
   - 檢查環境變數設定

3. **靜態資源載入失敗**
   - 檢查 `base` 路徑設定
   - 確認資源路徑正確

4. **API 請求失敗**
   - 檢查 CORS 設定
   - 確認 API 端點可訪問

### 除錯技巧

1. **檢查建置日誌**
```bash
npm run build -- --debug
```

2. **本地預覽建置結果**
```bash
npm run preview
```

3. **檢查網路請求**
   - 使用瀏覽器開發者工具
   - 檢查 Console 和 Network 標籤

## 📊 效能優化

### 1. 程式碼分割
```typescript
// 動態匯入元件
const ModuleManager = defineAsyncComponent(() => import('./components/ModuleManager.vue'))
```

### 2. 圖片優化
- 使用 WebP 格式
- 實作延遲載入
- 設定適當的圖片尺寸

### 3. 快取策略
- 設定適當的 HTTP 快取標頭
- 使用 Service Worker 進行離線快取

## 🔒 安全考量

### 1. 環境變數
- 不要在客戶端暴露敏感資訊
- 使用環境變數前綴 `VITE_`

### 2. 內容安全政策
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

### 3. HTTPS
- 強制使用 HTTPS
- 設定 HSTS 標頭

## 📈 監控和分析

### 1. 效能監控
- 使用 Google Analytics
- 實作錯誤追蹤（如 Sentry）

### 2. 使用者分析
- 追蹤頁面瀏覽量
- 監控使用者互動

---

**部署完成後，你的 DreamMaker 平台就可以在網路上使用了！** 🎉

