@echo off
cd /d "%~dp0"
start "" http://localhost:5300
node server.cjs
pause
