import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, AlertCircle, Check } from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { RUTAS } from "../../constants/navegacion.js";
import estilos from "./Perfil.module.css";

export default function Perfil() {
  const { usuarioActual, actualizarPerfil } = useAuth();
  const navigate = useNavigate();
  const temporizadorRedireccion = useRef(null);

  useEffect(() => () => clearTimeout(temporizadorRedireccion.current), []);

  const [datos, setDatos] = useState(() => ({
    nombre: usuarioActual?.nombre || "",
    correo: usuarioActual?.correo || "",
    nuevaPassword: "",
    confirmarPassword: "",
  }));
  const [error, setError] = useState("");
  const [notificacion, setNotificacion] = useState("");

  const manejarCambio = (campo) => (evento) => {
    setDatos((prev) => ({ ...prev, [campo]: evento.target.value }));
    if (error) setError("");
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim();

    if (nombre.length < 3) {
      setError("Ingresa tu nombre completo.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (datos.nuevaPassword) {
      if (datos.nuevaPassword.length < 6) {
        setError("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
      if (datos.nuevaPassword !== datos.confirmarPassword) {
        setError("Las contraseñas no coinciden.");
        return;
      }
    }

    const resultado = actualizarPerfil({
      nombre,
      correo,
      nuevaPassword: datos.nuevaPassword || null,
    });

    if (!resultado.exito) {
      setError(resultado.error);
      return;
    }

    setDatos((prev) => ({ ...prev, nuevaPassword: "", confirmarPassword: "" }));
    setError("");
    setNotificacion("Perfil actualizado correctamente.");
    clearTimeout(temporizadorRedireccion.current);
    temporizadorRedireccion.current = setTimeout(() => navigate(RUTAS.DASHBOARD), 1800);
  };

  return (
    <div className={estilos.pagina}>
      <Header rutaBreadcrumb={["Dashboard", "Perfil"]} titulo="Mi perfil" />

      <div className={estilos.tarjeta}>
        <div className={estilos.cabecera}>
          <span className={estilos.iconoWrap}>
            <User className={estilos.icono} aria-hidden="true" />
          </span>
          <div>
            <h2 className={estilos.titulo}>Editar perfil</h2>
            <p className={estilos.subtitulo}>
              Actualiza tus datos personales o cambia tu contraseña.
            </p>
          </div>
        </div>

        <form className={estilos.formulario} onSubmit={manejarEnvio} noValidate>
          {error && (
            <div className={estilos.alertError} role="alert">
              <AlertCircle className={estilos.iconoError} aria-hidden="true" />
              {error}
            </div>
          )}

          <div className={estilos.campo}>
            <label className={estilos.etiqueta} htmlFor="perfil-nombre">
              Nombre completo
            </label>
            <input
              id="perfil-nombre"
              type="text"
              required
              value={datos.nombre}
              onChange={manejarCambio("nombre")}
              className={estilos.input}
              placeholder="Ej. María Fernanda Ospina"
            />
          </div>

          <div className={estilos.campo}>
            <label className={estilos.etiqueta} htmlFor="perfil-correo">
              Correo electrónico
            </label>
            <input
              id="perfil-correo"
              type="email"
              required
              value={datos.correo}
              onChange={manejarCambio("correo")}
              className={estilos.input}
              placeholder="nombre@itm.edu.co"
            />
          </div>

          <div className={estilos.campo}>
            <label className={estilos.etiqueta} htmlFor="perfil-password">
              Nueva contraseña
            </label>
            <input
              id="perfil-password"
              type="password"
              value={datos.nuevaPassword}
              onChange={manejarCambio("nuevaPassword")}
              className={estilos.input}
              placeholder="Dejar en blanco para mantener la actual"
              autoComplete="new-password"
            />
          </div>

          <div className={estilos.campo}>
            <label className={estilos.etiqueta} htmlFor="perfil-confirmar">
              Confirmar contraseña
            </label>
            <input
              id="perfil-confirmar"
              type="password"
              value={datos.confirmarPassword}
              onChange={manejarCambio("confirmarPassword")}
              className={estilos.input}
              placeholder="Repite la nueva contraseña"
              autoComplete="new-password"
            />
          </div>

          <div className={estilos.acciones}>
            <button type="submit" className={estilos.botonGuardar}>
              <Check className={estilos.iconoBoton} aria-hidden="true" />
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      <Notificacion mensaje={notificacion} onCerrar={() => setNotificacion("")} />
    </div>
  );
}