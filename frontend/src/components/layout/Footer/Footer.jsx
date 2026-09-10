import { Mail, Phone, MapPin, Youtube, Facebook, Instagram } from "lucide-react";
import { informacionContacto } from "../../../data/observatorio.js";
import { redesSociales } from "../../../data/navegacion-publica.js";
import logoFooter from "../../../assets/images/observatorio/logo/logo-footer.png";
import styles from "./Footer.module.css";

const socialIcons = {
  Youtube: Youtube,
  Facebook: Facebook,
  Instagram: Instagram,
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div className={styles.brand}>
          <img
            src={logoFooter}
            alt="Logo del Observatorio Astronómico ITM"
            className={styles.brandImg}
          />
          <span className={styles.brandText}>
            <span className={styles.brandTextBlock}>Observatorio</span>
            <span className={styles.brandTextBlock}>Astronómico</span>
            <span className={styles.brandITM}>ITM</span>
          </span>
        </div>

        <div>
          <h3 className={styles.contactTitle}>Información de contacto</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <Mail className={styles.contactIcon} aria-hidden="true" />
              <a
                href={`mailto:${informacionContacto.correo}`}
                className={styles.contactLink}
              >
                {informacionContacto.correo}
              </a>
            </li>
            <li className={styles.contactItem}>
              <Phone className={styles.contactIcon} aria-hidden="true" />
              <a
                href={`tel:${informacionContacto.telefono.replace(/[^\d+]/g, "")}`}
                className={styles.contactLink}
              >
                {informacionContacto.telefono}
              </a>
            </li>
            <li className={styles.contactItem}>
              <MapPin className={styles.contactIcon} aria-hidden="true" />
              <span>{informacionContacto.ubicacion}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={styles.socialTitle}>Síguenos</h3>
          <div className={styles.socialLinks}>
            {redesSociales.map((red) => {
              const SocialIcon = socialIcons[red.icono];
              return (
                <a
                  key={red.nombre}
                  href={red.enlace}
                  aria-label={red.nombre}
                  className={styles.socialLink}
                >
                  {SocialIcon && (
                    <SocialIcon size={20} aria-hidden="true" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p className={styles.copyrightText}>
          © 2026 Observatorio Astronómico del ITM. Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
