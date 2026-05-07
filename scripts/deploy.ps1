# 部署脚本
# 用法: .\scripts\deploy.ps1 [-Target <preview|local|custom>]

param(
    [ValidateSet("preview", "local", "custom")]
    [string]$Target = "preview"
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       项目构建与部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 构建
Write-Host "正在构建生产版本..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败!" -ForegroundColor Red
    exit 1
}

Write-Host "构建成功! 输出目录: dist/" -ForegroundColor Green
Write-Host ""

# 2. 部署
switch ($Target) {
    "preview" {
        Write-Host "启动本地预览服务器..." -ForegroundColor Yellow
        Write-Host "   按 Ctrl+C 停止服务器" -ForegroundColor DarkGray
        Write-Host ""
        npm run preview
    }
    "local" {
        $deployPath = Read-Host "请输入本地部署路径 (例如 C:\inetpub\wwwroot\myapp)"
        if ([string]::IsNullOrWhiteSpace($deployPath)) {
            Write-Host "部署路径不能为空" -ForegroundColor Red
            exit 1
        }
        Write-Host "正在复制到 $deployPath ..." -ForegroundColor Yellow
        if (-not (Test-Path $deployPath)) {
            New-Item -ItemType Directory -Path $deployPath | Out-Null
        }
        Copy-Item -Path "dist\*" -Destination $deployPath -Recurse -Force
        Write-Host "已部署到 $deployPath" -ForegroundColor Green
    }
    "custom" {
        Write-Host "请在此脚本中添加自定义部署逻辑" -ForegroundColor Yellow
        Write-Host "   例如: 上传到 OSS、FTP、GitHub Pages 等" -ForegroundColor DarkGray
    }
}