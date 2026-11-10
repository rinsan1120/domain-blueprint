@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

set "CONFIG=examples\rins-workflow\domain-blueprint.config.json"
set "CLI=skills\domain-blueprint\src\cli.ts"
set "URL=http://127.0.0.1:8765/viewer.html"

if not exist "%CONFIG%" (
  echo [エラー] Rin's WorkFlow の設計図設定が見つかりません。
  echo [%CONFIG%] に4ファイルを配置してから実行してください。
  goto :failed
)

where node >nul 2>&1
if errorlevel 1 (
  echo [エラー] Node.js が見つかりません。PowerShellを開き直すかNode.jsを確認してください。
  goto :failed
)
where d2 >nul 2>&1
if errorlevel 1 (
  echo [エラー] D2 が見つかりません。PowerShellを開き直すかD2を確認してください。
  goto :failed
)

echo [設計図] 最新のJSONから図を更新しています...
node "%CLI%" build --config "%CONFIG%"
if errorlevel 1 (
  echo [エラー] 図の生成に失敗しました。上のログを確認してください。
  goto :failed
)

echo [設計図] サーバー起動後にブラウザを自動で開きます。
echo [設計図] 終了するには、このウィンドウで Ctrl+C を押してください。
start "" /min powershell.exe -NoProfile -WindowStyle Hidden -Command "$url='%URL%'; for($i=0; $i -lt 60; $i++){ try { $r=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1; if($r.StatusCode -eq 200){ Start-Process $url; break } } catch {} ; Start-Sleep -Milliseconds 250 }"
node "%CLI%" serve --config "%CONFIG%"
if errorlevel 1 (
  echo [エラー] サーバーの起動に失敗しました。ポート8765が使用中でないか確認してください。
  goto :failed
)
exit /b 0

:failed
echo.
pause
exit /b 1
