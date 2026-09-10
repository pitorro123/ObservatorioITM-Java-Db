import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User, UserRoundPen } from "lucide-react";
import estilos from "./Header.module.css";
import { useAuth } from "../../../context/AuthContext.jsx";

/**
 * Header compartido del panel.
 * rutaBreadcrumb: array de strings, ej. ["Dashboard", "Eventos"]
 * titulo: título grande de la página actual, ej. "Eventos"
 */
export default function Header({ rutaBreadcrumb = [], titulo = "" }) {
  const { usuarioActual } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const botonRef = useRef(null);

  useEffect(() => {
    if (!menuAbierto) return;

    const manejarClicFuera = (evento) => {
      if (botonRef.current && !botonRef.current.contains(evento.target)) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, [menuAbierto]);

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