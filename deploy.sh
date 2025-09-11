#!/bin/bash

# DreamMaker GitHub Pages 部署腳本

echo "🚀 開始部署 DreamMaker 到 GitHub Pages..."

# 進入專案目錄
cd dreammaker-app

# 安裝依賴
echo "📦 安裝依賴..."
npm install

# 建置專案
echo "🔨 建置專案..."
npm run build

# 檢查建置是否成功
if [ ! -d "dist" ]; then
    echo "❌ 建置失敗！dist 目錄不存在"
    exit 1
fi

echo "✅ 建置成功！"

# 部署到 GitHub Pages
echo "🌐 部署到 GitHub Pages..."
npm run deploy

echo "🎉 部署完成！請檢查 https://TwinkleStars1029.github.io/DreamMaker"
