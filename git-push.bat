@echo off
cd /d "%~dp0"
set LOGFILE=%~dp0git-push-log.txt
echo === Git Push Log === > "%LOGFILE%"
echo Started: %date% %time% >> "%LOGFILE%"
echo. >> "%LOGFILE%"

REM Remove stale lock file
if exist ".git\index.lock" (
    echo [info] Removing stale .git\index.lock >> "%LOGFILE%"
    del /f /q ".git\index.lock" >> "%LOGFILE%" 2>&1
)

REM Untrack ignored files
echo [info] Untracking ignored files... >> "%LOGFILE%"
git rm -r --cached --ignore-unmatch "*.xlsx" "*.xlsm" "*.xls" "*.docx" "*.doc" "*.pptx" "*.ppt" "*.pdf" >> "%LOGFILE%" 2>&1
git rm -r --cached --ignore-unmatch ".~lock.*" "~$*" >> "%LOGFILE%" 2>&1
git rm -r --cached --ignore-unmatch "*wireframe*.html" >> "%LOGFILE%" 2>&1
git rm -r --cached --ignore-unmatch "wireframes" "wireframes/*" >> "%LOGFILE%" 2>&1
git rm -r --cached --ignore-unmatch "_emergency_backup_*" >> "%LOGFILE%" 2>&1
git rm --cached --ignore-unmatch "tatus" >> "%LOGFILE%" 2>&1
for /f "delims=" %%f in ('git ls-files "*.md" 2^>nul') do (
    if /I not "%%f"=="README.md" git rm --cached --ignore-unmatch "%%f" >> "%LOGFILE%" 2>&1
)

REM Add
echo. >> "%LOGFILE%"
echo === git add -A === >> "%LOGFILE%"
git add -A >> "%LOGFILE%" 2>&1

REM Commit
echo. >> "%LOGFILE%"
echo === git commit === >> "%LOGFILE%"
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set d=%%a%%b%%c
for /f "tokens=1-2 delims=: " %%a in ("%time%") do set t=%%a%%b
git commit -m "update: %d%_%t%" >> "%LOGFILE%" 2>&1

REM Push - critical step, capture all output
echo. >> "%LOGFILE%"
echo === git push origin HEAD:main === >> "%LOGFILE%"
git push origin HEAD:main >> "%LOGFILE%" 2>&1
set PUSHRESULT=%errorlevel%

echo. >> "%LOGFILE%"
echo === git status after push === >> "%LOGFILE%"
git status -sb >> "%LOGFILE%" 2>&1
echo. >> "%LOGFILE%"
echo === last 5 local commits === >> "%LOGFILE%"
git log --oneline -5 >> "%LOGFILE%" 2>&1
echo. >> "%LOGFILE%"
echo === origin/main last 5 commits === >> "%LOGFILE%"
git log --oneline origin/main -5 >> "%LOGFILE%" 2>&1

echo. >> "%LOGFILE%"
echo Push exit code: %PUSHRESULT% >> "%LOGFILE%"
echo Finished: %date% %time% >> "%LOGFILE%"

REM Show summary on screen
echo.
echo === GitHub Upload Result ===
echo.
if %PUSHRESULT% EQU 0 (
    echo  [OK] Push succeeded!
) else (
    echo  [FAIL] Push failed - see git-push-log.txt for details
)
echo.
echo  Full log: git-push-log.txt
echo.
pause
