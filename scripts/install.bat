@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo        安装项目依赖
echo ========================================

if /I "%1"=="--clean" goto :clean
if /I "%1"=="-Clean" goto :clean
goto :install

:clean
echo 🧹 清理旧依赖...
if exist node_modules (
    rmdir /s /q node_modules
    echo    已删除 node_modules
)
if exist package-lock.json (
    del /f /q package-lock.json
    echo    已删除 package-lock.json
)

:install
echo 📦 正在安装依赖...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ 依赖安装失败!
    exit /b 1
)

echo ✅ 依赖安装完成!
endlocal
