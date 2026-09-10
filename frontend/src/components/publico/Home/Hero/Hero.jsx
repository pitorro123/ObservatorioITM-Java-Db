import Button from "../../../common/Button/Button.jsx";
import { contenidoPortada } from "../../../../data/observatorio.js";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.raiz}>
      <div
        className={styles.bgImage}
        style={{ backgroundImage: `url(${contenidoPortada.imagen})` }}
        role="img"
        aria-label="Cielo nocturno estrellado sobre la ciudad, visto desde el observatorio"
      />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.textBlock}>
          <h1 className={styles.title}>
            <span className={styles.titleLine1}>{contenidoPortada.tituloLinea1}</span>
            <span className={styles.titleLine2}>{contenidoPortada.tituloLinea2}</span>
          </h1>
          <p className={styles.description}>
            {contenidoPortada.descripcion}
          </p>
          <div className={styles.buttons}>
            <Button
              to={contenidoPortada.botonPrimario.ruta}
              variant="primary"
            >
              {contenidoPortada.botonPrimario.etiqueta}
            </Button>
            <Button
              to={contenidoPortada.botonSecundario.ruta}
              variant="secondary"
            >
              {contenidoPortada.botonSecundario.etiqueta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
