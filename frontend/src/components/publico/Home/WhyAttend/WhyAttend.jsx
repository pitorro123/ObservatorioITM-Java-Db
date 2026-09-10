import Icon from "../../../common/Icon/Icon.jsx";
import { porQueAsistir } from "../../../../data/observatorio.js";
import styles from "./WhyAttend.module.css";

export default function WhyAttend() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{porQueAsistir.titulo}</h3>

      <ul className={styles.list}>
        {porQueAsistir.items.map((item) => (
          <li key={item.id} className={styles.listItem}>
            <span className={styles.iconCircle}>
              <Icon name={item.icono} className={styles.iconSvg} />
            </span>
            <div>
              <p className={styles.itemTitle}>{item.titulo}</p>
              <p className={styles.itemDescription}>{item.descripcion}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
