@echo off
chcp 65001 >nul
setlocal

echo ========================================
echo        启动开发服务器
echo ========================================

echo 🚀 正在启动 Vite 开发服务器...
echo    按 Ctrl+C 停止服务器
echo.

call npm run dev

endlocal
