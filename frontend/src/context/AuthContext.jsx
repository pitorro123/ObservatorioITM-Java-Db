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

export function AuthProvider({ children }) {
  const [usuarioActual, setUsuarioActual] = useState(() =>
    leerAlmacenamiento("itm_usuario_actual", null)
  );
  const [docentes, setDocentes] = useState([]);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  const cargarDocentes = async () => {
    try {
      const lista = await listarDocentesApi();
      if (Array.isArray(lista)) {
        setDocentes(lista);
      }
    } catch {
      setDocentes([]);
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
          limpiarToken();
          setUsuarioActual(null);
          escribirAlmacenamiento("itm_usuario_actual", null);
        })
        .finally(() => {
          setCargandoAuth(false);
        });
    } else {
      const guardado = leerAlmacenamiento("itm_usuario_actual", null);
      if (guardado) {
        setUsuarioActual(guardado);
      }
      setCargandoAuth(false);
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
      // Ignorar
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
      return {
        exito: false,
        error: error?.mensaje || error?.message || "No se pudo actualizar el perfil.",
      };
    }
  };

  const crearDocente = async ({ nombre, correo }) => {
    try {
      const res = await crearDocenteApi({ nombre, correo });
      await cargarDocentes();
      const enlace = res.enlaceActivacion || `${window.location.origin}/login`;
      return { exito: true, docente: res, enlace };
    } catch (error) {
      return {
        exito: false,
        error: error?.mensaje || error?.message || "No se pudo crear el docente.",
      };
    }
  };

  const editarDocente = async (id, cambios) => {
    try {
      const res = await editarDocenteApi(id, cambios);
      await cargarDocentes();
      return { exito: true, docente: res };
    } catch (error) {
      return {
        exito: false,
        error: error?.mensaje || error?.message || "No se pudo editar el docente.",
      };
    }
  };

  const cambiarEstadoDocente = async (id, nuevoEstado) => {
    try {
      await cambiarEstadoDocenteApi(id, nuevoEstado);
      await cargarDocentes();
      return { exito: true };
    } catch (error) {
      return {
        exito: false,
        error: error?.mensaje || error?.message || "No se pudo cambiar el estado del docente.",
      };
    }
  };

  const eliminarDocente = async (id) => {
    try {
      await eliminarDocenteApi(id);
      setDocentes((prev) => prev.filter((d) => d.id !== id));
      return { exito: true };
    } catch (error) {
      return {
        exito: false,
        error: error?.mensaje || error?.message || "No se pudo eliminar el docente.",
      };
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
      const res = await cambiarPasswordApi({
        token,
        nuevaPassword,
        password: nuevaPassword,
      });
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
    usuarioActual,
    cargandoAuth,
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
