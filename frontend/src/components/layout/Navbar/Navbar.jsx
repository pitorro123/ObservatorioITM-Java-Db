import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Menu, UserRound } from "lucide-react";
import { enlacesNavegacionPublica } from "../../../data/navegacion-publica.js";
import MobileMenu from "../MobileMenu/MobileMenu.jsx";
import logo from "../../../assets/images/observatorio/logo/logo.png";
import styles from "./Navbar.module.css";

export default function Navbar({ simple = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <NavLink
            to="/"
            className={styles.logoLink}
            aria-label="Ir a la página de inicio del Observatorio Astronómico ITM"
          >
            <img
              src={logo}
              alt="Logo del Observatorio Astronómico ITM"
              className={styles.logoImg}
            />
            <span className={styles.logoText}>
              <span className={styles.logoTextBlock}>Observatorio</span>
              <span className={styles.logoTextBlock}>Astronómico</span>
              <span className={styles.logoITM}>ITM</span>
            </span>
          </NavLink>

          {!simple && (
            <Link to="/login" className={styles.enlaceSesion}>
              <UserRound className={styles.iconoSesion} aria-hidden="true" />
              <span>Acceder</span>
            </Link>
          )}
        </div>
      </div>

      {!simple && (
        <div className={styles.bottomBar}>
          <div className={styles.bottomBarInner}>
            <nav
              className={styles.navDesktop}
              aria-label="Navegación principal"
            >
              {enlacesNavegacionPublica.map((enlace) => (
                <NavLink
                  key={enlace.ruta}
                  to={enlace.ruta}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                  }
                >
                  {enlace.etiqueta}
                </NavLink>
              ))}
            </nav>

            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={isMenuOpen}
            >
              <Menu size={28} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
}
