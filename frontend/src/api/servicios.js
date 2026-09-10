import { apiGet, apiPost, apiPut, apiDelete } from "./cliente.js";

// Autenticación
export const iniciarSesion = (cuerpo) => apiPost("/auth/login", cuerpo);
export const cerrarSesion = () => apiPost("/auth/logout", {});
export const obtenerUsuarioActual = () => apiGet("/auth/usuario");
export const solicitarRecuperacion = (cuerpo) => apiPost("/auth/recuperar", cuerpo);
export const cambiarPassword = (cuerpo) => apiPost("/auth/cambiar-password", cuerpo);

// Usuarios (docentes)
export const listarDocentes = () => apiGet("/usuarios/docentes");
export const crearDocente = (cuerpo) => apiPost("/usuarios/docentes", cuerpo);
export const editarDocente = (id, cuerpo) => apiPut(`/usuarios/docentes/${id}`, cuerpo);
export const eliminarDocente = (id) => apiDelete(`/usuarios/docentes/${id}`);
export const actualizarPerfil = (cuerpo) => apiPut("/usuarios/perfil", cuerpo);

// Eventos
export const listarEventosPublicados = () => apiGet("/eventos/publicados");
export const obtenerEventoPublico = (id) => apiGet(`/eventos/p/${id}`);
export const listarEventos = () => apiGet("/eventos");
export const obtenerEvento = (id) => apiGet(`/eventos/${id}`);
export const crearEvento = (cuerpo) => apiPost("/eventos", cuerpo);
export const editarEvento = (id, cuerpo) => apiPut(`/eventos/${id}`, cuerpo);
export const publicarEvento = (id) => apiPut(`/eventos/${id}/publicar`, {});
export const cancelarEvento = (id) => apiPut(`/eventos/${id}/cancelar`, {});
export const eliminarEvento = (id) => apiDelete(`/eventos/${id}`);

// Inscripciones
export const inscribir = (cuerpo) => apiPost("/inscripciones", cuerpo);
export const listarInscripcionesEvento = (eventoId) => apiGet(`/inscripciones/evento/${eventoId}`);
export const validarInscripcion = (codigo) => apiGet(`/inscripciones/validar/${encodeURIComponent(codigo)}`);
export const marcarAsistencia = (cuerpo) => apiPost("/inscripciones/asistencia", cuerpo);
export const enviarQrDocente = (codigo) => apiPost(`/inscripciones/${encodeURIComponent(codigo)}/enviar-qr-docente`, {});

// Feedback
export const agregarFeedback = (cuerpo) => apiPost("/feedback", cuerpo);
export const listarFeedbackEvento = (eventoId) => apiGet(`/feedback/evento/${eventoId}`);

// Contenido
export const obtenerSemillero = () => apiGet("/contenido/semillero");
export const obtenerObservatorio = () => apiGet("/contenido/observatorio");
export const guardarSemillero = (cuerpo) => apiPut("/contenido/semillero", cuerpo);
export const guardarObservatorio = (cuerpo) => apiPut("/contenido/observatorio", cuerpo);