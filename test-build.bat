@echo off
echo 🧪 測試建置流程...

cd dreammaker-app

echo 📦 安裝依賴...
npm install

if %errorlevel% neq 0 (
    echo ❌ 依賴安裝失敗
    pause
    exit /b 1
)

echo 🔨 建置專案...
npm run build

if %errorlevel% neq 0 (
    echo ❌ 建置失敗
    pause
    exit /b 1
)

echo ✅ 建置成功！
echo 📁 檢查 dist 目錄...
if exist "dist" (
    echo ✅ dist 目錄存在
    dir dist
) else (
    echo ❌ dist 目錄不存在
)

pause
