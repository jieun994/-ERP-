@echo off
cd /d "%~dp0"
echo.
echo === GitHub Upload Start ===
echo.

REM Remove stale lock file
if exist ".git\index.lock" (
    echo [info] Removing stale .git\index.lock
    del /f /q ".git\index.lock"
)

REM Untrack files matching .gitignore patterns (keep local files)
echo [info] Untracking ignored files from index...
git rm -r --cached --ignore-unmatch "*.xlsx" "*.xlsm" "*.xls" "*.docx" "*.doc" "*.pptx" "*.ppt" >nul 2>&1
git rm -r --cached --ignore-unmatch ".~lock.*" "~$*" >nul 2>&1
git rm -r --cached --ignore-unmatch "*wireframe*.html" >nul 2>&1
git rm -r --cached --ignore-unmatch "_emergency_backup_*" >nul 2>&1
git rm --cached --ignore-unmatch "tatus" >nul 2>&1
for /f "delims=" %%f in ('git ls-files "*.md" 2^>nul') do (
    if /I not "%%f"=="README.md" git rm --cached --ignore-unmatch "%%f" >nul 2>&1
)

REM Add, commit, push
git add -A
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set d=%%a%%b%%c
for /f "tokens=1-2 delims=: " %%a in ("%time%") do set t=%%a%%b
git commit -m "update: %d%_%t%"
git push origin HEAD:main
echo.
echo === Done! ===
echo.
pause
