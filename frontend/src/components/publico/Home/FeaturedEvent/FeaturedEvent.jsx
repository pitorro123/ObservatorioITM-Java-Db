import { useMemo } from "react";
import { Clock, CalendarDays, MapPin } from "lucide-react";
import Button from "../../../common/Button/Button.jsx";
import { useEventosContext } from "../../../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../../../utils/formato.js";
import styles from "./FeaturedEvent.module.css";

const hoyEnTexto = () => new Date().toISOString().slice(0, 10);

export default function FeaturedEvent() {
  const { eventosPublicados } = useEventosContext();

  const evento = useMemo(() => {
    const hoy = hoyEnTexto();
    const proximos = eventosPublicados
      .filter((e) => e.estado === "publicado" && e.fecha >= hoy)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    if (proximos.length > 0) return proximos[0];

    const pasados = eventosPublicados
      .filter((e) => e.estado === "publicado")
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return pasados[0] ?? null;
  }, [eventosPublicados]);

  if (!evento) return null;

  return (
    <article className={styles.card}>
      {evento.imagen && (
        <div className={styles.imageWrap}>
          <img
            src={evento.imagen}
            alt={evento.titulo}
            className={styles.image}
          />
        </div>
      )}
      <div className={styles.info}>
        <h3 className={styles.infoTitle}>{evento.titulo}</h3>
        <p className={styles.infoDescription}>{evento.descripcion}</p>

        <ul className={styles.meta}>
          <li className={styles.metaItem}>
            <Clock className={styles.metaIcon} aria-hidden="true" />
            {formatearHora(evento.hora)}
          </li>
          <li className={styles.metaItem}>
            <CalendarDays className={styles.metaIcon} aria-hidden="true" />
            {formatearFecha(evento.fecha)}
          </li>
          <li className={styles.metaItem}>
            <MapPin className={styles.metaIcon} aria-hidden="true" />
            {evento.lugar}
          </li>
        </ul>

        <Button to={`/eventos/${evento.id}`} variant="primary" className={styles.btn}>
          Inscribirme
        </Button>
      </div>
    </article>
  );
}