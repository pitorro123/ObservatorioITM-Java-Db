import { Link } from "react-router-dom";
import { Building2, Sparkles, ArrowRight, CloudRain, MapPin, Loader2 } from "lucide-react";
import { estadoObservatorio } from "../../../../data/observatorio.js";
import { useClima } from "../../../../hooks/useClima.js";
import telescopioImg from "../../../../assets/images/observatorio/icons/telescopio.png";
import styles from "./ObservatoryStatus.module.css";

export default function ObservatoryStatus() {
  const { estado, cargando, error } = useClima();

  const esDesfavorable = estado?.observatorio?.esDesfavorable;
  const estadoAbierto = cargando
    ? "CONSULTANDO"
    : error
      ? "SIN CONSULTA"
      : (estado?.observatorio?.observatorioEstado ?? "ABIERTO");

  return (
    <section className={styles.raiz}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.iconCircleTelescopio}>
            <img
              src={telescopioImg}
              alt="Telescopio del Observatorio"
              className={styles.telescopioImg}
            />
          </span>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{estadoObservatorio.titulo}</h2>
            <p className={styles.description}>
              {cargando
                ? "Consultando las condiciones meteorológicas en tiempo real…"
                : error
                  ? "No pudimos consultar el clima en este momento."
                  : estadoObservatorio.descripcion}
            </p>
            <Link to="/clima" className={styles.link}>
              {estadoObservatorio.linkLabel}
              <ArrowRight className={styles.linkIcon} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {cargando ? (
          <div className={styles.statusCard} role="status">
            <span className={`${styles.iconCircle} ${styles.iconBlue}`}>
              <Loader2 className={`${styles.iconSvg} ${styles.girando}`} aria-hidden="true" />
            </span>
            <div>
              <p className={styles.statusLabel}>{estadoObservatorio.estado.etiqueta}</p>
              <p className={styles.statusValue}>CONSULTANDO</p>
              <p className={styles.statusDesc}>Obteniendo datos del clima en Medellín…</p>
            </div>
          </div>
        ) : (
          <div
            className={styles.statusCard}
            style={error ? { opacity: 0.6 } : undefined}
            role="status"
          >
            <span className={`${styles.iconCircle} ${styles.iconBlue}`}>
              <Building2 className={styles.iconSvg} aria-hidden="true" />
            </span>
            <div>
              <p className={styles.statusLabel}>{estadoObservatorio.estado.etiqueta}</p>
              <p className={styles.statusValue}>{estadoAbierto}</p>
              <p className={styles.statusDesc}>
                {error
                  ? "Activa el modo automático para obtener datos en tiempo real."
                  : (estado?.observatorio?.observatorioEstadoDesc ?? estadoObservatorio.estado.descripcion)}
              </p>
            </div>
          </div>
        )}

        {!cargando && !error && (
          <div className={styles.statusCard}>
            <span
              className={`${styles.iconCircle} ${
                esDesfavorable ? styles.iconAmber : styles.iconEmerald
              }`}
            >
              <Sparkles
                className={
                  esDesfavorable ? styles.iconSvgAmber : styles.iconSvgEmerald
                }
                aria-hidden="true"
              />
            </span>
            <div>
              <p className={styles.statusLabel}>{estadoObservatorio.condiciones.etiqueta}</p>
              <p className={esDesfavorable ? styles.statusValueAmber : styles.statusValue}>
                {esDesfavorable ? "ACTIVIDAD EN SALA" : estado.observatorio.estadoValor}
              </p>
              <p className={styles.statusDesc}>
                {esDesfavorable
                  ? estado.observatorio.mensajeLanding
                  : estado.observatorio.recomendacion}
              </p>
            </div>
          </div>
        )}

        {!cargando && !error && (
          <div className={styles.statusCard} role="status">
            <span className={`${styles.iconCircle} ${styles.iconEmerald}`}>
              <CloudRain className={styles.iconSvgEmerald} aria-hidden="true" />
            </span>
            <div>
              <p className={styles.statusLabel}>Clima ahora en Medellín</p>
              <p className={styles.statusValue}>
                {Math.round(estado.temperatura)}°C ·{" "}
                {estado.probabilidadLluviaHoy != null
                  ? `${estado.probabilidadLluviaHoy}% lluvia`
                  : estado.descripcion ?? "—"}
              </p>
              <p className={styles.statusDesc}>
                <MapPin className={styles.iconInline} aria-hidden="true" />
                Sede Fraternidad · Observatorio Astronómico ITM
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}