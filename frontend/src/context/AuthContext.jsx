import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  leerAlmacenamiento,
  escribirAlmacenamiento,
} from "../utils/almacenamiento.js";

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

function generarToken() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function generarPasswordTemporal() {
  return Math.random().toString(36).slice(2, 10);
}

export function AuthProvider({ children }) {
  const [usuarios, setUsuarios] = useState(() =>
    leerAlmacenamiento("itm_usuarios", usuariosIniciales)
  );
  const [usuarioIdActual, setUsuarioIdActual] = useState(() =>
    leerAlmacenamiento("itm_usuario_actual_id", null)
  );

  useEffect(() => {
    escribirAlmacenamiento("itm_usuarios", usuarios);
  }, [usuarios]);

  useEffect(() => {
    escribirAlmacenamiento("itm_usuario_actual_id", usuarioIdActual);
  }, [usuarioIdActual]);

  const usuarioActual = useMemo(() => {
    if (usuarioIdActual === null || usuarioIdActual === undefined) return null;
    return (
      usuarios.find((usuario) => usuario.id === usuarioIdActual) ?? null
    );
  }, [usuarios, usuarioIdActual]);

  const login = (correo, password) => {
    const usuario = usuarios.find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    if (!usuario) {
      return { exito: false, error: "No existe una cuenta con ese correo." };
    }

    if (usuario.estado !== "Activo") {
      return { exito: false, error: "La cuenta está desactivada. Contacta al administrador." };
    }

    if (!usuario.password) {
      return {
        exito: false,
        error:
          "Tu contraseña aún no ha sido establecida. Usa el enlace enviado a tu correo para configurarla.",
      };
    }

    if (usuario.password !== password) {
      return { exito: false, error: "Correo o contraseña incorrectos." };
    }

    setUsuarioIdActual(usuario.id);
    return { exito: true };
  };

  const logout = () => {
    setUsuarioIdActual(null);
  };

  const actualizarPerfil = ({ nombre, correo, nuevaPassword }) => {
    const correoRepetido = usuarios.some(
      (u) =>
        u.id !== usuarioActual?.id &&
        u.correo.toLowerCase() === (correo || "").trim().toLowerCase()
    );
    if (correoRepetido) {
      return { exito: false, error: "Ya existe una cuenta con ese correo electrónico." };
    }

    const cambios = {};
    if (nombre) cambios.nombre = nombre.trim();
    if (correo) cambios.correo = correo.trim();
    if (nuevaPassword) cambios.password = nuevaPassword;

    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioActual?.id ? { ...u, ...cambios } : u))
    );

    return { exito: true };
  };

  const docentes = usuarios.filter((usuario) => usuario.rol === "Docente");

  const crearDocente = ({ nombre, correo }) => {
    const correoRegistrado = usuarios.some(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );
    if (correoRegistrado) {
      return { exito: false, error: "Ya existe una cuenta con ese correo electrónico." };
    }

    const token = generarToken();
    const passwordTemporal = generarPasswordTemporal();
    const nuevoDocente = {
      id: usuarios.reduce((max, u) => Math.max(max, u.id), 0) + 1,
      nombre: nombre.trim(),
      correo: correo.trim(),
      rol: "Docente",
      password: null,
      passwordTemporal,
      estado: "Pendiente",
      token,
    };

    setUsuarios((prev) => [...prev, nuevoDocente]);

    const enlace = `${window.location.origin}/cambiar-password?token=${token}`;
    return { exito: true, docente: nuevoDocente, enlace };
  };

  const editarDocente = (id, cambios) => {
    const correoRepetido = usuarios.some(
      (u) =>
        u.id !== id &&
        u.correo.toLowerCase() === (cambios.correo || "").toLowerCase()
    );
    if (correoRepetido) {
      return { exito: false, error: "Ya existe una cuenta con ese correo electrónico." };
    }

    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...cambios } : u))
    );

    return { exito: true };
  };

  const cambiarEstadoDocente = (id, nuevoEstado) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === id ? { ...u, estado: nuevoEstado } : u))
    );
    return { exito: true };
  };

  const eliminarDocente = (id) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  const solicitarRecuperacion = (correo) => {
    const usuario = usuarios.find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    if (!usuario) {
      return { exito: false, error: "No existe una cuenta con ese correo." };
    }

    if (usuario.estado !== "Activo") {
      return { exito: false, error: "La cuenta está desactivada. Contacta al administrador." };
    }

    const token = generarToken();
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuario.id ? { ...u, token } : u))
    );

    const enlace = `${window.location.origin}/cambiar-password?token=${token}`;
    return { exito: true, enlace, usuario };
  };

  const establecerPassword = (token, nuevaPassword) => {
    const usuario = usuarios.find((u) => u.token === token);
    if (!usuario) {
      return { exito: false, error: "El enlace no es válido o ya fue utilizado." };
    }

    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === usuario.id
          ? { ...u, password: nuevaPassword, token: null, estado: "Activo", passwordTemporal: null }
          : u
      )
    );

    return { exito: true, usuario };
  };

  const esAdmin = usuarioActual?.rol === "Administrador";
  const esDocente = usuarioActual?.rol === "Docente";
  const estaAutenticado = Boolean(
    usuarioActual && usuarioActual.estado !== "Desactivado"
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