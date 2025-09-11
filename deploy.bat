@echo off
REM DreamMaker GitHub Pages 部署腳本 (Windows)

echo 🚀 開始部署 DreamMaker 到 GitHub Pages...

REM 進入專案目錄
cd dreammaker-app

REM 安裝依賴
echo 📦 安裝依賴...
npm ci

REM 建置專案
echo 🔨 建置專案...
npm run build

REM 檢查建置是否成功
if not exist "dist" (
    echo ❌ 建置失敗！dist 目錄不存在
    pause
    exit /b 1
)

echo ✅ 建置成功！

REM 部署到 GitHub Pages
echo 🌐 部署到 GitHub Pages...
npm run deploy

echo 🎉 部署完成！請檢查 https://TwinkleStars1029.github.io/DreamMaker
pause
