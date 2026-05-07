# 安装依赖脚本
# 用法: .\scripts\install.ps1 [-Clean]

param(
    [switch]$Clean
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       安装项目依赖" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($Clean) {
    Write-Host "正在清理旧依赖..." -ForegroundColor Yellow
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "   已删除 node_modules" -ForegroundColor Green
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
        Write-Host "   已删除 package-lock.json" -ForegroundColor Green
    }
}

Write-Host "正在安装依赖..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "依赖安装失败!" -ForegroundColor Red
    exit 1
}

Write-Host "依赖安装完成!" -ForegroundColor Green