@echo off
cd /d "%~dp0"
echo.
echo === GitHub Upload Start ===
echo.
git add -A
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set d=%%a%%b%%c
for /f "tokens=1-2 delims=: " %%a in ("%time%") do set t=%%a%%b
git commit -m "update: %d%_%t%"
git push origin HEAD:main
echo.
echo === Done! ===
echo.
pause
