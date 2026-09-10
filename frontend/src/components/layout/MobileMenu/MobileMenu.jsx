import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { enlacesNavegacionPublica } from "../../../data/navegacion-publica.js";
import styles from "./MobileMenu.module.css";

export default function MobileMenu({ isOpen, onClose }) {
  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : styles.overlayClosed}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menú de navegación"
    >
      <button
        type="button"
        className={styles.overlayBg}
        aria-label="Cerrar menú"
        onClick={onClose}
      />

      <div
        className={`${styles.panel} ${isOpen ? styles.panelOpen : styles.panelClosed}`}
      >
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Observatorio ITM</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú de navegación"
            className={styles.panelCloseBtn}
          >
            <X size={24} aria-hidden="true" />
          </button>
        </div>

        <nav
          className={styles.navMobile}
          aria-label="Navegación móvil"
        >
          {enlacesNavegacionPublica.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              onClick={onClose}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              {enlace.etiqueta}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
