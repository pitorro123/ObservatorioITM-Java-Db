import Icon from "../../../common/Icon/Icon.jsx";
import Button from "../../../common/Button/Button.jsx";
import { tarjetasInformacion } from "../../../../data/observatorio.js";
import styles from "./InformationCards.module.css";

export default function InformationCards() {
  return (
    <section className={styles.raiz}>
      <div className={styles.grid}>
        {tarjetasInformacion.map((card, index) => (
          <article
            key={index}
            className={`${styles.card} ${card.gradiente === "azul" ? styles.gradientBlue : styles.gradientPurple}`}
          >
              <span className={styles.iconWrap}>
                <Icon name={card.icono} className={styles.iconSvg} />
              </span>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{card.titulo}</h3>
                <p className={styles.cardDescription}>{card.descripcion}</p>
                <Button to={card.boton.ruta} variant="ghost" className={styles.cardBtn}>
                  {card.boton.etiqueta}
                </Button>
              </div>
          </article>
        ))}
      </div>
    </section>
  );
}
