@echo off
cd /d "%~dp0"
echo.
echo ==========================================
echo  Git Fix + Cleanup + Push Diagnostic
echo ==========================================
echo.

REM ====== 1) Remove stale lock file ======
echo [1/6] Cleaning .git lock file...
if exist ".git\index.lock" (
    del /f /q ".git\index.lock"
    if exist ".git\index.lock" (
        echo    [FAIL] Could not delete index.lock.
        echo    Please delete .git\index.lock manually from Explorer.
        pause
        exit /b 1
    ) else (
        echo    [OK] index.lock removed
    )
) else (
    echo    [OK] No lock file
)

REM ====== 2) Show branch and remote ======
echo.
echo [2/6] Current branch and remote:
git branch --show-current
git remote -v
echo.

REM ====== 3) Untrack files matching .gitignore ======
echo [3/6] Untracking document files per .gitignore...
git rm -r --cached --ignore-unmatch "*.xlsx" "*.xlsm" "*.xls" "*.docx" "*.doc" "*.pptx" "*.ppt" "*.pdf" >nul 2>&1
git rm -r --cached --ignore-unmatch ".~lock.*" "~$*" >nul 2>&1
git rm -r --cached --ignore-unmatch "*wireframe*.html" >nul 2>&1
git rm -r --cached --ignore-unmatch "wireframes" "wireframes/*" >nul 2>&1
git rm -r --cached --ignore-unmatch "_emergency_backup_*" >nul 2>&1
git rm --cached --ignore-unmatch "tatus" >nul 2>&1
for /f "delims=" %%f in ('git ls-files "*.md" 2^>nul') do (
    if /I not "%%f"=="README.md" git rm --cached --ignore-unmatch "%%f" >nul 2>&1
)
echo    [OK] Untrack done

REM ====== 4) Stage changes ======
echo.
echo [4/6] Staging changes...
git add -A
echo    [OK] Stage done

REM ====== 5) Commit ======
echo.
echo [5/6] Committing...
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set d=%%a%%b%%c
for /f "tokens=1-2 delims=: " %%a in ("%time%") do set t=%%a%%b
git commit -m "update: %d%_%t%"
if errorlevel 1 (
    echo    [INFO] Nothing to commit or commit failed
) else (
    echo    [OK] Commit done
)

REM ====== 6) Push ======
echo.
echo [6/6] Pushing HEAD to origin/main...
git push origin HEAD:main
if errorlevel 1 (
    echo.
    echo    [FAIL] Push failed!
    echo    Fetching remote to check status...
    git fetch origin
    echo.
    echo    Commits on remote/main that are NOT in HEAD:
    git log --oneline HEAD..origin/main
) else (
    echo    [OK] Push succeeded!
)

echo.
echo ==========================================
echo  Done
echo ==========================================
pause
