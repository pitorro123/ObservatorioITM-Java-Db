@echo off
title Observatorio ITM - Launcher
chcp 65001 > nul
echo ========================================================
echo   Iniciando Observatorio Astronómico ITM (Full Stack)
echo ========================================================

echo [1/3] Verificando Base de Datos MariaDB (puerto 3306)...
netstat -ano | findstr LISTENING | findstr :3306 > nul
if errorlevel 1 (
    echo      Iniciando servicio MariaDB...
    start "MariaDB Server" /min "C:\Program Files\MariaDB 12.3\bin\mysqld.exe" --console
    timeout /t 3 > nul
) else (
    echo      MariaDB ya está en ejecución.
)

echo [2/3] Iniciando Backend Spring Boot (puerto 8080)...
start "Backend - Spring Boot" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run"

echo [3/3] Iniciando Frontend React + Vite (puerto 5173)...
start "Frontend - React Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Esperando a que el frontend y backend inicien...
timeout /t 4 > nul

echo Abriendo navegador en http://localhost:5173 ...
start http://localhost:5173

echo ========================================================
echo   ¡Proyecto en marcha!
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080/api
echo   Swagger UI: http://localhost:8080/swagger-ui.html
echo ========================================================

