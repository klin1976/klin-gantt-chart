@echo off
:: 切換到這個 .bat 檔案所在的資料夾 (這行最重要！)
cd /d "%~dp0"

echo ==========================================
echo       GitHub Auto Uploader - Klin
echo ==========================================
echo.

:: 1. Add files
echo [1/3] Adding files (git add)...
git add .

:: 2. Commit
set /p commit_msg="Enter commit message (Press Enter for 'Update code'): "
if "%commit_msg%"=="" set commit_msg=Update code

echo.
echo [2/3] Committing (git commit)...
git commit -m "%commit_msg%"

:: 3. Push
echo.
echo [3/3] Pushing to GitHub (git push)...
git push

echo.
echo ==========================================
echo              Done!
echo ==========================================
pause