@echo off
cd /d "%~dp0"

if not exist node_modules (
  echo React dependencies are not installed yet.
  echo.
  echo Run this command in this folder:
  echo npm install
  echo.
  pause
  exit /b
)

start "" "http://127.0.0.1:5173"
call npm run dev
