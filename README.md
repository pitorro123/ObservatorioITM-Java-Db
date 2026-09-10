# ObservatorioITM-Java-Db

Sistema de gestión de eventos y control de asistencia del **Observatorio Astronómico ITM** con base de datos real (sin datos mockeados).

## Estructura

- `backend/` — API Spring Boot (Java 17, MySQL, envío de correos SMTP con HTML).
- `frontend/` — React (Vite) adaptado para consumir la API del backend.

## Requisitos

- Java 17+ y Maven (o usa el wrapper `mvnw` incluido).
- MySQL corriendo en local.
- Node.js 18+ (para el frontend).

## 1. Configurar y levantar el backend

1. Crea la base de datos en MySQL:

```sql
CREATE DATABASE observatorio_itm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Copia `backend/.env.example` a `backend/.env` y completa **solo** tus datos:

```bash
cd backend
cp .env.example .env
```

```properties
# backend/.env
DB_USERNAME=root
DB_PASSWORD=tu-password-de-mysql
MAIL_USERNAME=tucorreo@gmail.com
MAIL_PASSWORD=tu-token-de-aplicacion
```

> Para Gmail crea una **contraseña de aplicación** (Google → Seguridad → Verificación en 2 pasos → Contraseña de aplicaciones). No uses la contraseña normal del correo.

3. Ejecuta:

```bash
cd backend
./mvnw spring-boot:run
```

La primera vez crea las tablas automáticamente (`ddl-auto=update`), el **administrador inicial** y el contenido institucional de las páginas públicas. No se crean eventos ni inscripciones de ejemplo.

- API en `http://localhost:8080/api`
- Documentación Swagger en `http://localhost:8080/swagger-ui.html`
- Administrador por defecto: `admin@itm.edu.co` / `admin123` (ajustable con `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el `.env`).

## 2. Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

Front en `http://localhost:5173`. La API se usa por defecto en `http://localhost:8080/api`; si cambias el puerto, define `VITE_API_URL` en `frontend/.env.local`.

## Flujo de cuentas

- El **administrador** inicia sesión con su correo y contraseña, y crea cuentas de **docentes** desde el panel.
- Al crear un docente, el sistema envía un correo con una contraseña temporal y un enlace de activación; el docente la cambia la primera vez que ingresa.
- La recuperación de contraseña también llega por correo.
- Al inscribirse a un evento, el participante recibe un correo con su código QR de asistencia. Los docentes pueden reenviar ese QR desde el panel y marcar/validar asistencia escaneando el código.

> Si `MAIL_USERNAME` no está configurado, el sistema funciona pero no envía los correos.