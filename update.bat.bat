@echo off
chcp 65001 >nul
echo ==========================================
echo       GitHub 自動上傳小工具 - Klin
echo ==========================================
echo.

:: 1. 加入所有檔案
echo [1/3] 正在加入變更檔案 (git add)...
git add .

:: 2. 詢問提交說明
set /p commit_msg="請輸入提交說明 (直接按 Enter 則使用 'Update code'): "

:: 如果使用者沒輸入，就用預設文字
if "%commit_msg%"=="" set commit_msg=Update code

echo.
echo [2/3] 正在提交版本 (git commit)...
git commit -m "%commit_msg%"

:: 3. 推送到遠端
echo.
echo [3/3] 正在上傳到 GitHub (git push)...
git push

echo.
echo ==========================================
echo              上傳完成！
echo ==========================================
pause