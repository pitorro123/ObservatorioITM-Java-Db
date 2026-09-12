import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User, UserRoundPen, CloudRain } from "lucide-react";
import estilos from "./Header.module.css";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useClima } from "../../../hooks/useClima.js";

/**
 * Header compartido del panel.
 * rutaBreadcrumb: array de strings, ej. ["Dashboard", "Eventos"]
 * titulo: título grande de la página actual, ej. "Eventos"
 */
export default function Header({ rutaBreadcrumb = [], titulo = "" }) {
  const { usuarioActual } = useAuth();
  const { estado: estadoClima } = useClima();
  const esDesfavorable = estadoClima?.observatorio?.esDesfavorable;

  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [alertaAbierta, setAlertaAbierta] = useState(false);
  const botonRef = useRef(null);
  const alertaRef = useRef(null);

  useEffect(() => {
    if (!menuAbierto && !alertaAbierta) return;

    const manejarClicFuera = (evento) => {
      if (botonRef.current && !botonRef.current.contains(evento.target)) {
        setMenuAbierto(false);
      }
      if (alertaRef.current && !alertaRef.current.contains(evento.target)) {
        setAlertaAbierta(false);
      }
    };

    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, [menuAbierto, alertaAbierta]);

  const irAPerfil = () => {
    setMenuAbierto(false);
    navigate("/admin/perfil");
  };

  return (
    <header className={estilos.encabezado}>
      <div className={estilos.bloqueTitulo}>
        <nav aria-label="Ruta de navegación" className={estilos.breadcrumb}>
          {rutaBreadcrumb.map((paso, indice) => (
            <span key={paso} className={estilos.pasoBreadcrumb}>
              <span
                className={
                  indice === rutaBreadcrumb.length - 1
                    ? estilos.pasoActual
                    : estilos.pasoEnlace
                }
              >
                {paso}
              </span>
              {indice < rutaBreadcrumb.length - 1 && (
                <span className={estilos.separador}>/</span>
              )}
            </span>
          ))}
        </nav>
        <h1 className={estilos.titulo}>{titulo}</h1>
      </div>

      <div className={estilos.bloqueAcciones}>
        {esDesfavorable && (
          <div className={estilos.alertaWrap} ref={alertaRef}>
            <button
              type="button"
              className={estilos.botonAlertaClima}
              aria-label="Aviso meteorológico para docentes"
              aria-expanded={alertaAbierta}
              onClick={() => setAlertaAbierta((prev) => !prev)}
            >
              <CloudRain className={estilos.iconoAlerta} aria-hidden="true" />
              <span className={estilos.puntoAlerta} aria-hidden="true" />
            </button>

            {alertaAbierta && (
              <div className={estilos.popoverAlerta} role="dialog" aria-label="Aviso meteorológico">
                <div className={estilos.popoverCabecera}>
                  <CloudRain className={estilos.popoverIcono} aria-hidden="true" />
                  <div>
                    <h4 className={estilos.popoverTitulo}>Aviso Meteorológico</h4>
                    <span className={estilos.popoverSubtitulo}>Directriz del Observatorio</span>
                  </div>
                </div>
                <p className={estilos.popoverCuerpo}>
                  {estadoClima?.observatorio?.mensajeDocente}
                </p>
                <div className={estilos.popoverPie}>
                  <span>Estado: <strong>No cancelar eventos</strong> · Trasladar a sala</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={estilos.configuracionWrap} ref={botonRef}>
          <button
            type="button"
            className={estilos.botonIcono}
            aria-label="Abrir configuración"
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((prev) => !prev)}
          >
            <Settings className={estilos.icono} aria-hidden="true" />
          </button>

          {menuAbierto && (
            <div className={estilos.menuConfiguracion} role="menu">
              <div className={estilos.menuEncabezado}>
                <User className={estilos.menuIcono} aria-hidden="true" />
                <div>
                  <p className={estilos.menuNombre}>
                    {usuarioActual?.nombre || "Invitado"}
                  </p>
                  <p className={estilos.menuCorreo}>
                    {usuarioActual?.correo || "Sin sesión"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className={estilos.menuOpcion}
                role="menuitem"
                onClick={irAPerfil}
              >
                <UserRoundPen className={estilos.menuIconoOpcion} aria-hidden="true" />
                Editar perfil
              </button>
            </div>
          )}
        </div>

        <div className={estilos.perfilUsuario}>
          <span className={estilos.avatarContenedor}>
            <User className={estilos.iconoAvatar} aria-hidden="true" />
          </span>
          <span className={estilos.datosUsuario}>
            <span className={estilos.nombreUsuario}>
              {usuarioActual?.nombre || "Invitado"}
            </span>
            <span className={estilos.rolUsuario}>
              {usuarioActual?.rol || "Sin sesión"}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}