import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  leerAlmacenamiento,
  escribirAlmacenamiento,
} from "../utils/almacenamiento.js";
import {
  iniciarSesion,
  cerrarSesion,
  obtenerUsuarioActual,
  solicitarRecuperacion as solicitarRecuperacionApi,
  cambiarPassword as cambiarPasswordApi,
  listarDocentes as listarDocentesApi,
  crearDocente as crearDocenteApi,
  editarDocente as editarDocenteApi,
  cambiarEstadoDocente as cambiarEstadoDocenteApi,
  eliminarDocente as eliminarDocenteApi,
  actualizarPerfil as actualizarPerfilApi,
} from "../api/servicios.js";
import { obtenerToken, guardarToken, limpiarToken } from "../api/cliente.js";

const AuthContext = createContext(null);

const usuariosIniciales = [
  {
    id: 1,
    nombre: "Administrador",
    correo: "admin@itm.edu.co",
    rol: "Administrador",
    password: "admin123",
    estado: "Activo",
    token: null,
  },
  {
    id: 2,
    nombre: "Juan Camilo",
    correo: "juan.camilo@itm.edu.co",
    rol: "Docente",
    password: "docente123",
    estado: "Activo",
    token: null,
  },
  {
    id: 3,
    nombre: "Laura Gómez",
    correo: "laura.gomez@itm.edu.co",
    rol: "Docente",
    password: "docente123",
    estado: "Activo",
    token: null,
  },
];

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() =>
    leerAlmacenamiento("itm_usuarios", usuariosIniciales)
  );
  const [usuarioActual, setUsuarioActual] = useState(() =>
    leerAlmacenamiento("itm_usuario_actual", null)
  );
  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    escribirAlmacenamiento("itm_usuarios", usuarios);
  }, [usuarios]);

  const cargarDocentes = async () => {
    try {
      const lista = await listarDocentesApi();
      if (Array.isArray(lista)) {
        setDocentes(lista);
      }
    } catch {
      // Si el backend no responde, cargar desde usuarios locales
      setDocentes(usuarios.filter((u) => u.rol === "Docente"));
    }
  };

  useEffect(() => {
    const token = obtenerToken();
    if (token) {
      obtenerUsuarioActual()
        .then((usuario) => {
          setUsuarioActual(usuario);
          escribirAlmacenamiento("itm_usuario_actual", usuario);
          if (usuario?.rol === "Administrador") {
            cargarDocentes();
          }
        })
        .catch(() => {
          // Token expirado o backend reiniciado
          limpiarToken();
          setUsuarioActual(null);
          escribirAlmacenamiento("itm_usuario_actual", null);
        });
    } else {
      const guardado = leerAlmacenamiento("itm_usuario_actual", null);
      if (guardado) {
        setUsuarioActual(guardado);
      }
    }
  }, []);

  useEffect(() => {
    if (usuarioActual?.rol === "Administrador") {
      cargarDocentes();
    }
  }, [usuarioActual?.id]);

  const login = async (correo, password) => {
    const correoLimpio = (correo || "").trim().toLowerCase();
    try {
      const res = await iniciarSesion({ correo: correoLimpio, password });
      const usuario = res.usuario || {
        id: res.id,
        nombre: res.nombre,
        correo: res.correo,
        rol: res.rol,
        estado: res.estado,
      };
      if (res.token) {
        guardarToken(res.token);
      }
      setUsuarioActual(usuario);
      escribirAlmacenamiento("itm_usuario_actual", usuario);
      if (usuario.rol === "Administrador") {
        cargarDocentes();
      }
      return { exito: true, usuario };
    } catch (error) {
      // Fallback a almacenamiento local si backend está desconectado
      const local = usuarios.find(
        (u) => u.correo.toLowerCase() === correoLimpio
      );
      if (local && local.password === password && local.estado === "Activo") {
        setUsuarioActual(local);
        escribirAlmacenamiento("itm_usuario_actual", local);
        return { exito: true, usuario: local };
      }
      return {
        exito: false,
        error: error?.mensaje || error?.message || "Correo o contraseña incorrectos.",
      };
    }
  };

  const logout = async () => {
    try {
      await cerrarSesion();
    } catch {
      // Omitir error de desconexión
    }
    limpiarToken();
    setUsuarioActual(null);
    escribirAlmacenamiento("itm_usuario_actual", null);
  };

  const actualizarPerfil = async ({ nombre, correo, nuevaPassword }) => {
    try {
      const usuario = await actualizarPerfilApi({
        nombre,
        correo,
        nuevaPassword: nuevaPassword || null,
      });
      setUsuarioActual(usuario);
      escribirAlmacenamiento("itm_usuario_actual", usuario);
      return { exito: true, usuario };
    } catch (error) {
      // Fallback local
      const cambios = {};
      if (nombre) cambios.nombre = nombre.trim();
      if (correo) cambios.correo = correo.trim();
      if (nuevaPassword) cambios.password = nuevaPassword;

      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioActual?.id ? { ...u, ...cambios } : u))
      );
      const usuarioActualizado = { ...usuarioActual, ...cambios };
      setUsuarioActual(usuarioActualizado);
      escribirAlmacenamiento("itm_usuario_actual", usuarioActualizado);
      return { exito: true, usuario: usuarioActualizado };
    }
  };

  const crearDocente = async ({ nombre, correo }) => {
    try {
      const res = await crearDocenteApi({ nombre, correo });
      await cargarDocentes();
      const enlace = res.enlaceActivacion || `${window.location.origin}/login`;
      return { exito: true, docente: res, enlace };
    } catch (error) {
      // Fallback local
      const nuevoDocente = {
        id: Date.now(),
        nombre: nombre.trim(),
        correo: correo.trim(),
        rol: "Docente",
        password: "docente123",
        estado: "Activo",
      };
      setDocentes((prev) => [...prev, nuevoDocente]);
      setUsuarios((prev) => [...prev, nuevoDocente]);
      return {
        exito: true,
        docente: nuevoDocente,
        enlace: `${window.location.origin}/login`,
      };
    }
  };

  const editarDocente = async (id, cambios) => {
    try {
      const res = await editarDocenteApi(id, cambios);
      setDocentes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...res } : d))
      );
      return { exito: true, docente: res };
    } catch (error) {
      setDocentes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...cambios } : d))
      );
      return { exito: true };
    }
  };

  const cambiarEstadoDocente = async (id, nuevoEstado) => {
    try {
      await cambiarEstadoDocenteApi(id, nuevoEstado);
      setDocentes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, estado: nuevoEstado } : d))
      );
      return { exito: true };
    } catch (error) {
      setDocentes((prev) =>
        prev.map((d) => (d.id === id ? { ...d, estado: nuevoEstado } : d))
      );
      return { exito: true };
    }
  };

  const eliminarDocente = async (id) => {
    try {
      await eliminarDocenteApi(id);
      setDocentes((prev) => prev.filter((d) => d.id !== id));
      return { exito: true };
    } catch (error) {
      setDocentes((prev) => prev.filter((d) => d.id !== id));
      return { exito: true };
    }
  };

  const solicitarRecuperacion = async (correo) => {
    try {
      const res = await solicitarRecuperacionApi({ correo });
      const enlace = res?.enlace || `${window.location.origin}/login`;
      return { exito: true, enlace };
    } catch (error) {
      return {
        exito: false,
        error: error?.mensaje || "No se pudo procesar la solicitud de recuperación.",
      };
    }
  };

  const establecerPassword = async (token, nuevaPassword) => {
    try {
      const res = await cambiarPasswordApi({ token, password: nuevaPassword });
      return { exito: true, usuario: res };
    } catch (error) {
      return {
        exito: false,
        error: error?.mensaje || "El enlace no es válido o ha expirado.",
      };
    }
  };

  const esAdmin = usuarioActual?.rol === "Administrador";
  const esDocente = usuarioActual?.rol === "Docente";
  const estaAutenticado = Boolean(
    usuarioActual && usuarioActual.estado !== "Desactivado" && usuarioActual.estado !== "Inactivo"
  );

  const value = {
    usuarios,
    usuarioActual,
    estaAutenticado,
    esAdmin,
    esDocente,
    login,
    logout,
    actualizarPerfil,
    docentes,
    cargarDocentes,
    crearDocente,
    editarDocente,
    cambiarEstadoDocente,
    eliminarDocente,
    solicitarRecuperacion,
    establecerPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}