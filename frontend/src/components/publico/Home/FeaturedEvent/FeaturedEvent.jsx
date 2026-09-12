import { useMemo, useState } from "react";
import { Clock, CalendarDays, MapPin } from "lucide-react";
import Button from "../../../common/Button/Button.jsx";
import ModalEventoCancelado from "../../../common/ModalEventoCancelado/ModalEventoCancelado.jsx";
import { useEventosContext } from "../../../../context/EventosContext.jsx";
import { useClima } from "../../../../hooks/useClima.js";
import { formatearFecha, formatearHora } from "../../../../utils/formato.js";
import styles from "./FeaturedEvent.module.css";

const hoyEnTexto = () => new Date().toISOString().slice(0, 10);

export default function FeaturedEvent() {
  const { eventosPublicados } = useEventosContext();
  const { estado: estadoClima } = useClima();
  const esDesfavorable = estadoClima?.observatorio?.esDesfavorable;
  const [modalCancelado, setModalCancelado] = useState(false);

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

        {esDesfavorable && (
          <div className={styles.avisoClima} role="status">
            <span className={styles.avisoClimaPunto} aria-hidden="true" />
            <p className={styles.avisoClimaTexto}>
              <strong>Evento confirmado</strong>
            </p>
          </div>
        )}

        {evento.estado === "cancelado" ? (
          <button
            type="button"
            className={`${styles.btn} ${styles.btnCancelado}`}
            onClick={() => setModalCancelado(true)}
          >
            Inscribirme
          </button>
        ) : (
          <Button to={`/eventos/${evento.id}`} variant="primary" className={styles.btn}>
            Inscribirme
          </Button>
        )}

        <ModalEventoCancelado
          abierto={modalCancelado}
          onCerrar={() => setModalCancelado(false)}
          tituloEvento={evento?.titulo}
          motivo={evento?.motivoCancelacion || "clima"}
        />
      </div>
    </article>
  );
}