@echo off
title LariGuide
cd /d "%~dp0"
node launch.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] LariGuide cerró con un error. Revisa los mensajes anteriores.
    pause
)
