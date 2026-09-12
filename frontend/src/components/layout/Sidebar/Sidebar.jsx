import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  CalendarDays,
  ClipboardCheck,
  KeyRound,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Settings,
  User,
  UserRoundPen,
} from "lucide-react";
import { ENLACES_NAVEGACION } from "../../../constants/navegacion.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import estilos from "./Sidebar.module.css";

const mapaIconos = {
  LayoutGrid: LayoutGrid,
  CalendarDays: CalendarDays,
  ClipboardCheck: ClipboardCheck,
  KeyRound: KeyRound,
  GraduationCap: GraduationCap,
};

export default function Sidebar() {
  const { usuarioActual, logout, esAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuConfigAbierto, setMenuConfigAbierto] = useState(false);
  const configRef = useRef(null);

  useEffect(() => {
    if (!menuConfigAbierto) return;

    const manejarClicFuera = (evento) => {
      if (configRef.current && !configRef.current.contains(evento.target)) {
        setMenuConfigAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, [menuConfigAbierto]);

  const irAPerfil = () => {
    setMenuConfigAbierto(false);
    navigate("/admin/perfil");
  };

  const enlacesAccesibles = ENLACES_NAVEGACION.filter((enlace) => {
    if (!enlace.roles) return true;
    return enlace.roles.some(
      (rol) => rol === usuarioActual?.rol || (rol === "Administrador" && esAdmin)
    );
  });

  return (
    <>
      <div className={estilos.barraMovil}>
        <button
          type="button"
          className={estilos.botonMenu}
          onClick={() => {
            setMenuAbierto(true);
            setMenuConfigAbierto(false);
          }}
          aria-label="Abrir menú de navegación"
        >
          <Menu className={estilos.iconoMenu} aria-hidden="true" />
        </button>
        <img
          src="/images/LogoItm.png"
          alt="Logo ITM Institución Universitaria"
          className={estilos.logoMovil}
        />

        <div className={estilos.accionesMovil}>
          <div className={estilos.configMovilWrap} ref={configRef}>
            <button
              type="button"
              className={estilos.botonAccionMovil}
              aria-label="Abrir configuración"
              aria-expanded={menuConfigAbierto}
              onClick={() => setMenuConfigAbierto((prev) => !prev)}
            >
              <Settings className={estilos.iconoAccionMovil} aria-hidden="true" />
            </button>

            {menuConfigAbierto && (
              <div className={estilos.menuConfigMovil} role="menu">
                <div className={estilos.menuEncabezadoMovil}>
                  <User className={estilos.menuIconoMovil} aria-hidden="true" />
                  <div>
                    <p className={estilos.menuNombreMovil}>
                      {usuarioActual?.nombre || "Invitado"}
                    </p>
                    <p className={estilos.menuCorreoMovil}>
                      {usuarioActual?.correo || "Sin sesión"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={estilos.menuOpcionMovil}
                  role="menuitem"
                  onClick={irAPerfil}
                >
                  <UserRoundPen className={estilos.menuIconoOpcionMovil} aria-hidden="true" />
                  Editar perfil
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className={estilos.botonAccionMovil}
            aria-label="Ver perfil"
            onClick={irAPerfil}
          >
            <User className={estilos.iconoAccionMovil} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className={`${estilos.overlayMovil} ${
          menuAbierto ? estilos.overlayMovilVisible : ""
        }`}
        onClick={() => setMenuAbierto(false)}
        aria-hidden="true"
      />

      <aside
        className={`${estilos.barraLateral} ${
          menuAbierto ? estilos.barraLateralAbierta : ""
        }`}
      >
        <div className={estilos.encabezadoLogo}>
          <img
            src="/images/LogoItm.png"
            alt="Logo ITM Institución Universitaria"
            className={estilos.logo}
          />
          <button
            type="button"
            className={estilos.botonCerrarMenu}
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú de navegación"
          >
            <X className={estilos.iconoCerrarMenu} aria-hidden="true" />
          </button>
        </div>

        <nav className={estilos.navegacion} aria-label="Navegación principal">
          <ul className={estilos.listaEnlaces}>
            {enlacesAccesibles.map((enlace) => {
              const IconoEnlace = mapaIconos[enlace.icono];
              return (
                <li key={enlace.ruta}>
                  <NavLink
                    to={enlace.ruta}
                    end={enlace.ruta === "/"}
                    onClick={() => setMenuAbierto(false)}
                    className={({ isActive }) =>
                      isActive
                        ? `${estilos.enlace} ${estilos.enlaceActivo}`
                        : estilos.enlace
                    }
                  >
                    {IconoEnlace && (
                      <IconoEnlace className={estilos.icono} aria-hidden="true" />
                    )}
                    <span>{enlace.etiqueta}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className={estilos.botonCerrarSesion}
          onClick={logout}
        >
          <LogOut className={estilos.icono} aria-hidden="true" />
          <span>Cerrar Sesión</span>
        </button>
      </aside>
    </>
  );
}