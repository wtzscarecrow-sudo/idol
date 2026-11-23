@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "偶戏服务" /min cmd /c "python scripts/local_site.py --port 43182"
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:43182/story.html
