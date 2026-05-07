@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo ========================================
echo        项目构建与部署
echo ========================================

set "TARGET=%1"
if not defined TARGET set "TARGET=preview"

REM 1. 构建
echo 🔨 正在构建生产版本...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ 构建失败!
    exit /b 1
)
echo ✅ 构建成功! 输出目录: dist/
echo.

REM 2. 部署
if /I "%TARGET%"=="preview" goto :preview
if /I "%TARGET%"=="local" goto :local
if /I "%TARGET%"=="custom" goto :custom
goto :preview

:preview
echo 🌐 启动本地预览服务器...
echo    按 Ctrl+C 停止服务器
echo.
call npm run preview
goto :end

:local
set /p DEPLOY_PATH="请输入本地部署路径 (例如 C:\inetpub\wwwroot\myapp): "
if "!DEPLOY_PATH!"=="" (
    echo ❌ 部署路径不能为空
    exit /b 1
)
echo 📂 正在复制到 !DEPLOY_PATH! ...
if not exist "!DEPLOY_PATH!" mkdir "!DEPLOY_PATH!"
xcopy /e /i /y "dist\*" "!DEPLOY_PATH!\" >nul
echo ✅ 已部署到 !DEPLOY_PATH!
goto :end

:custom
echo 📝 请在此脚本中添加自定义部署逻辑
echo    例如: 上传到 OSS、FTP、GitHub Pages 等
goto :end

:end
endlocal
