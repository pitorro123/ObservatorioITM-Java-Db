-- ==============================================================================
-- BASE DE DATOS: Observatorio Astronómico ITM
-- Motor: PostgreSQL (Compatible con Neon Tech / AWS / Local)
-- Modelo Relacional en 3FN (Tercera Forma Normal)
-- ==============================================================================

-- 1. TABLA: permisos
CREATE TABLE IF NOT EXISTS permisos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- 2. TABLA: roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 3. TABLA: roles_permisos (Relación Muchos a Muchos)
CREATE TABLE IF NOT EXISTS roles_permisos (
    rol_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permiso_id BIGINT NOT NULL REFERENCES permisos(id) ON DELETE CASCADE,
    PRIMARY KEY (rol_id, permiso_id)
);

-- 4. TABLA: programas_academicos (3FN para participantes)
CREATE TABLE IF NOT EXISTS programas_academicos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE
);

-- 5. TABLA: usuarios (Gestión y autenticación)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    imagen_url VARCHAR(500),
    rol_id BIGINT REFERENCES roles(id),
    rol VARCHAR(255),
    estado VARCHAR(50) NOT NULL DEFAULT 'Activo',
    creado_por_id BIGINT REFERENCES usuarios(id),
    password_temporal VARCHAR(255),
    token VARCHAR(500),
    login_token VARCHAR(500),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: eventos (Catálogo de eventos astronómicos)
CREATE TABLE IF NOT EXISTS eventos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion VARCHAR(2000) NOT NULL,
    fecha DATE NOT NULL,
    hora VARCHAR(20) NOT NULL,
    hora_inicio VARCHAR(20),
    hora_fin VARCHAR(20),
    lugar VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    imagen TEXT,
    estado VARCHAR(50) NOT NULL DEFAULT 'publicado',
    tipo VARCHAR(50) NOT NULL DEFAULT 'abierto',
    es_masivo BOOLEAN DEFAULT FALSE,
    capacidad INTEGER DEFAULT 50,
    motivo_cancelacion VARCHAR(255),
    ubicacion_mapa VARCHAR(1000),
    creado_por_id BIGINT,
    creado_por_nombre VARCHAR(255),
    creado_por_rol VARCHAR(255),
    creado_por_usuario_id BIGINT REFERENCES usuarios(id),
    inscritos INTEGER DEFAULT 0,
    asistentes INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: participantes (Normalización 3FN del público asistente)
CREATE TABLE IF NOT EXISTS participantes (
    id BIGSERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(20) DEFAULT 'CC',
    numero_documento VARCHAR(50) NOT NULL,
    correo VARCHAR(150) NOT NULL,
    telefono VARCHAR(30),
    relacion_universidad VARCHAR(50) DEFAULT 'Externo',
    programa_id BIGINT REFERENCES programas_academicos(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: inscripciones (Registro a eventos y logística especial NASA Space)
CREATE TABLE IF NOT EXISTS inscripciones (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(40),
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    participante_id BIGINT REFERENCES participantes(id),
    nombre VARCHAR(255),
    tipo_documento VARCHAR(50),
    numero_documento VARCHAR(50),
    correo VARCHAR(255),
    telefono VARCHAR(50),
    relacion_universidad VARCHAR(50),
    programa_academico VARCHAR(150),
    es_masivo BOOLEAN DEFAULT FALSE,
    es_vegetariano BOOLEAN DEFAULT FALSE,
    es_vegano BOOLEAN DEFAULT FALSE,
    preferencia_alimenticia VARCHAR(50),
    alergias_alimentos VARCHAR(255),
    eps VARCHAR(100),
    tipo_vehiculo VARCHAR(50),
    placa_vehiculo VARCHAR(20),
    asistencia VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLA: asistencias (Confirmación de asistencia escaneada por QR o presencial)
CREATE TABLE IF NOT EXISTS asistencias (
    id BIGSERIAL PRIMARY KEY,
    inscripcion_id BIGINT NOT NULL UNIQUE REFERENCES inscripciones(id) ON DELETE CASCADE,
    fecha_hora_asistencia TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLA: contenidos (Contenido dinámico de Semillero y Observatorio)
CREATE TABLE IF NOT EXISTS contenidos (
    id BIGSERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor VARCHAR(5000) NOT NULL,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- DATOS INICIALES (SEMILLA COMPLETA SINCRONIZADA)
-- ==============================================================================

-- Permisos
INSERT INTO permisos (nombre) VALUES
('CREAR_EVENTO'), ('EDITAR_EVENTO'), ('ELIMINAR_EVENTO'),
('PUBLICAR_EVENTO'), ('CANCELAR_EVENTO'), ('VALIDAR_ASISTENCIA'), ('GESTIONAR_DOCENTES')
ON CONFLICT (nombre) DO NOTHING;

-- Roles
INSERT INTO roles (nombre) VALUES ('Administrador'), ('Docente')
ON CONFLICT (nombre) DO NOTHING;

-- Relación Roles - Permisos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p WHERE r.nombre = 'Administrador'
ON CONFLICT DO NOTHING;

INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r, permisos p 
WHERE r.nombre = 'Docente' AND p.nombre IN ('CREAR_EVENTO', 'EDITAR_EVENTO', 'VALIDAR_ASISTENCIA')
ON CONFLICT DO NOTHING;

-- Programas Académicos ITM (33 Programas)
INSERT INTO programas_academicos (nombre) VALUES
('Ingeniería Biomédica'), ('Ingeniería de Sistemas'), ('Ingeniería de Telecomunicaciones'),
('Ingeniería Electromecánica'), ('Ingeniería Electrónica'), ('Ingeniería Mecatrónica'),
('Tecnología en Automatización Electrónica'), ('Tecnología en Desarrollo de Software'),
('Tecnología en Gestión de Redes de Telecomunicaciones'), ('Tecnología en Mantenimiento de Equipo Biomédico'),
('Tecnología en Sistemas de Información'), ('Tecnología en Sistemas Mecatrónicos'),
('Tecnología en Telecomunicaciones'), ('Administración Tecnológica'), ('Contaduría Pública'),
('Ingeniería de la Producción'), ('Ingeniería Financiera'), ('Tecnología en Análisis de Costos y Presupuestos'),
('Tecnología en Gestión Administrativa'), ('Tecnología en Producción Industrial'),
('Ciencia de Datos'), ('Química Industrial'), ('Tecnología en Calidad'),
('Tecnología en Control de la Calidad'), ('Artes de la Grabación y Producción Musical'),
('Artes Visuales'), ('Cine'), ('Diseño Industrial'),
('Tecnología en Diseño y Programación de Soluciones de Software'),
('Tecnología en Informática Musical'), ('Tecnología en Producción de Cine y TV'),
('Posgrado / Maestría / Doctorado ITM'), ('Otro programa académico')
ON CONFLICT (nombre) DO NOTHING;

-- Usuarios (1 Admin + 5 Docentes)
INSERT INTO usuarios (nombre, correo, password, rol_id, rol, estado, imagen_url)
SELECT 'Administrador', 'admin@itm.edu.co', '$2a$10$w09ZlMsz7e31gqQ/c8qZ5u03lX5w/98B5s5Jeq1e9/U16rGj0bWvG', r.id, 'Administrador', 'Activo', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
FROM roles r WHERE r.nombre = 'Administrador'
ON CONFLICT (correo) DO UPDATE SET estado = 'Activo';

INSERT INTO usuarios (nombre, correo, password, rol_id, rol, estado, creado_por_id, imagen_url)
SELECT 'Juan Camilo', 'juan.camilo@itm.edu.co', '$2a$10$22n2jKj3iR.Q26i5jM6zceD8cO645bS1rS3PcqH9xWfE5.lC2x2Ym', r.id, 'Docente', 'Activo', u.id, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
FROM roles r, usuarios u WHERE r.nombre = 'Docente' AND u.correo = 'admin@itm.edu.co'
ON CONFLICT (correo) DO UPDATE SET estado = 'Activo';

INSERT INTO usuarios (nombre, correo, password, rol_id, rol, estado, creado_por_id, imagen_url)
SELECT 'Laura Gómez', 'laura.gomez@itm.edu.co', '$2a$10$22n2jKj3iR.Q26i5jM6zceD8cO645bS1rS3PcqH9xWfE5.lC2x2Ym', r.id, 'Docente', 'Activo', u.id, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
FROM roles r, usuarios u WHERE r.nombre = 'Docente' AND u.correo = 'admin@itm.edu.co'
ON CONFLICT (correo) DO UPDATE SET estado = 'Activo';

INSERT INTO usuarios (nombre, correo, password, rol_id, rol, estado, creado_por_id)
SELECT 'maria isabel', 'mimg25348@gmail.com', '$2a$10$22n2jKj3iR.Q26i5jM6zceD8cO645bS1rS3PcqH9xWfE5.lC2x2Ym', r.id, 'Docente', 'Pendiente', u.id
FROM roles r, usuarios u WHERE r.nombre = 'Docente' AND u.correo = 'admin@itm.edu.co'
ON CONFLICT (correo) DO UPDATE SET estado = 'Pendiente';

INSERT INTO usuarios (nombre, correo, password, rol_id, rol, estado, creado_por_id)
SELECT 'felipemejia', 'pipe.kmx@hotmail.com', '$2a$10$22n2jKj3iR.Q26i5jM6zceD8cO645bS1rS3PcqH9xWfE5.lC2x2Ym', r.id, 'Docente', 'Activo', u.id
FROM roles r, usuarios u WHERE r.nombre = 'Docente' AND u.correo = 'admin@itm.edu.co'
ON CONFLICT (correo) DO UPDATE SET estado = 'Activo';

INSERT INTO usuarios (nombre, correo, password, rol_id, rol, estado, creado_por_id)
SELECT 'Nelson Aníbal Miranda Ríos', 'nelsonmiranda@itm.edu.co', '$2a$10$22n2jKj3iR.Q26i5jM6zceD8cO645bS1rS3PcqH9xWfE5.lC2x2Ym', r.id, 'Docente', 'Activo', u.id
FROM roles r, usuarios u WHERE r.nombre = 'Docente' AND u.correo = 'admin@itm.edu.co'
ON CONFLICT (correo) DO UPDATE SET estado = 'Activo';
