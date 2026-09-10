const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");
const CLAVE_TOKEN = "itm_token";

export function obtenerToken() {
  try {
    return localStorage.getItem(CLAVE_TOKEN);
  } catch {
    return null;
  }
}

export function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE_TOKEN, token);
  } catch {
    // almacenamiento no disponible
  }
}

export function limpiarToken() {
  try {
    localStorage.removeItem(CLAVE_TOKEN);
  } catch {
    // almacenamiento no disponible
  }
}

async function peticion(ruta, opciones = {}) {
  const cabeceras = { "Content-Type": "application/json", ...(opciones.cabeceras || {}) };
  const token = obtenerToken();
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: opciones.metodo || "GET",
      headers: cabeceras,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
    });
  } catch {
    throw { mensaje: "No se pudo conectar con el servidor." };
  }

  const cuerpo = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw { mensaje: cuerpo.mensaje || "Ocurrió un error inesperado." };
  }

  return cuerpo;
}

export function apiGet(ruta) {
  return peticion(ruta, { metodo: "GET" });
}

export function apiPost(ruta, cuerpo) {
  return peticion(ruta, { metodo: "POST", cuerpo });
}

export function apiPut(ruta, cuerpo) {
  return peticion(ruta, { metodo: "PUT", cuerpo });
}

export function apiDelete(ruta) {
  return peticion(ruta, { metodo: "DELETE" });
}

export function urlImagen(rutaImagen) {
  if (!rutaImagen) return "";
  if (/^(https?:|data:|blob:)/.test(rutaImagen)) return rutaImagen;
  return rutaImagen;
}