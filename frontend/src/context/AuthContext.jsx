import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  obtenerToken,
  guardarToken,
  limpiarToken,
} from "../api/cliente.js";
import * as api from "../api/servicios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [restaurando, setRestaurando] = useState(() => Boolean(obtenerToken()));
  const [docentes, setDocentes] = useState([]);

  const recargarDocentes = async () => {
    try {
      const lista = await api.listarDocentes();
      setDocentes(lista);
    } catch {
      setDocentes([]);
    }
  };

  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      setRestaurando(false);
      return;
    }

    api
      .obtenerUsuarioActual()
      .then((usuario) => {
        setUsuarioActual(usuario);
        if (usuario.rol === "Administrador") {
          recargarDocentes();
        }
      })
      .catch(() => {
        limpiarToken();
        setUsuarioActual(null);
      })
      .finally(() => setRestaurando(false));
  }, []);

  const login = async (correo, password) => {
    try {
      const resultado = await api.iniciarSesion({ correo, password });
      guardarToken(resultado.token || resultado.loginToken);
      setUsuarioActual({
        id: resultado.id,
        nombre: resultado.nombre,
        correo: resultado.correo,
        rol: resultado.rol,
        estado: resultado.estado,
      });
      if (resultado.rol === "Administrador") {
        recargarDocentes();
      }
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo iniciar sesión." };
    }
  };

  const logout = () => {
    limpiarToken();
    setUsuarioActual(null);
    setDocentes([]);
    api.cerrarSesion().catch(() => {});
  };

  const actualizarPerfil = async ({ nombre, correo, nuevaPassword }) => {
    try {
      const actualizado = await api.actualizarPerfil({
        nombre,
        correo,
        nuevaPassword: nuevaPassword || null,
      });
      setUsuarioActual(actualizado);
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo actualizar el perfil." };
    }
  };

  const crearDocente = async ({ nombre, correo }) => {
    try {
      const docente = await api.crearDocente({ nombre, correo });
      await recargarDocentes();
      return {
        exito: true,
        docente,
        passwordTemporal: docente.passwordTemporal,
        enlace: docente.enlace,
      };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo crear el docente." };
    }
  };

  const editarDocente = async (id, cambios) => {
    try {
      await api.editarDocente(id, cambios);
      await recargarDocentes();
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo actualizar el docente." };
    }
  };

  const eliminarDocente = async (id) => {
    try {
      await api.eliminarDocente(id);
      await recargarDocentes();
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo eliminar el docente." };
    }
  };

  const solicitarRecuperacion = async (correo) => {
    try {
      await api.solicitarRecuperacion({ correo });
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo enviar el correo." };
    }
  };

  const establecerPassword = async (token, nuevaPassword) => {
    try {
      const usuario = await api.cambiarPassword({ token, nuevaPassword });
      return { exito: true, usuario };
    } catch (error) {
      return { exito: false, error: error.mensaje || "El enlace no es válido o ya fue utilizado." };
    }
  };

  const esAdmin = usuarioActual?.rol === "Administrador";
  const esDocente = usuarioActual?.rol === "Docente";
  const estaAutenticado = Boolean(usuarioActual);

  const value = {
    usuarioActual,
    estaAutenticado,
    esAdmin,
    esDocente,
    restaurando,
    login,
    logout,
    actualizarPerfil,
    docentes,
    recargarDocentes,
    crearDocente,
    editarDocente,
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