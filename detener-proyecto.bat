@echo off
title Observatorio ITM - Detener Servicios
chcp 65001 > nul
echo ========================================================
echo   Deteniendo servicios del Observatorio ITM...
echo ========================================================

echo Deteniendo Frontend (puerto 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr :5173') do taskkill /PID %%a /F > nul 2>&1

echo Deteniendo Backend (puerto 8080)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr LISTENING ^| findstr :8080') do taskkill /PID %%a /F > nul 2>&1

echo Deteniendo Base de Datos MariaDB (puerto 3306)...
taskkill /IM mysqld.exe /F > nul 2>&1

echo.
echo ========================================================
echo   Todos los servicios han sido detenidos.
echo ========================================================
pause

