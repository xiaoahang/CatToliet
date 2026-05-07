# 调试/开发脚本
# 用法: .\scripts\dev.ps1

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       启动开发服务器" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "正在启动 Vite 开发服务器..." -ForegroundColor Yellow
Write-Host "   按 Ctrl+C 停止服务器" -ForegroundColor DarkGray
Write-Host ""

npm run dev