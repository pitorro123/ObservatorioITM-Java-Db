# ObservatorioITM-Java-Db

Sistema de gestión de eventos y control de asistencia del **Observatorio Astronómico ITM** con base de datos real (sin datos mockeados).

## Estructura

- `backend/` — API Spring Boot (Java 17, MySQL, envío de correos SMTP con HTML).
- `frontend/` — React (Vite) adaptado para consumir la API del backend.

> Para configurar solo necesitas tu correo y token de SMTP (ver `README` de `backend/`).