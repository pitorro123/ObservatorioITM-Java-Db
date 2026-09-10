import { Building2, Target, Eye, Telescope } from "lucide-react";
import { useContenido } from "../../context/ContenidoContext.jsx";
import estilos from "./SobreNosotros.module.css";

export default function SobreNosotros() {
  const { observatorio } = useContenido();

  return (
    <>
      <section className={estilos.hero}>
        <div className={estilos.colIzquierda}>
          <article className={estilos.heroCard}>
            <span className={estilos.heroIconWrap}>
              <Building2 className={estilos.heroIcon} aria-hidden="true" />
            </span>
            <div className={estilos.heroContent}>
              <h1 className={estilos.heroTitle}>{observatorio.titulo}</h1>
              <p className={estilos.heroDescription}>
                {observatorio.descripcion}
              </p>
            </div>
          </article>

          <div className={estilos.cardsGrid}>
            <div className={estilos.card}>
              <h2 className={estilos.cardTitle}>
                <Target
                  className={estilos.cardTitleIcon}
                  aria-hidden="true"
                />
                <span>Misión</span>
              </h2>
              <p className={estilos.cardDescription}>{observatorio.mision}</p>
            </div>

            <div className={estilos.card}>
              <h2 className={estilos.cardTitle}>
                <Eye className={estilos.cardTitleIcon} aria-hidden="true" />
                <span>Visión</span>
              </h2>
              <p className={estilos.cardDescription}>{observatorio.vision}</p>
            </div>
          </div>
        </div>

        <div className={estilos.trayectoriaBox}>
          <h2 className={estilos.trayectoriaTitle}>Nuestra trayectoria</h2>
          <ul className={estilos.trayectoriaList}>
            {observatorio.trayectoria.map((parrafo) => (
              <li key={parrafo} className={estilos.trayectoriaItem}>
                <span className={estilos.trayectoriaBala} aria-hidden="true" />
                <span>{parrafo}</span>
              </li>
            ))}
          </ul>

          <div className={estilos.servicios}>
            <h2 className={estilos.serviciosTitle}>Servicios y recursos</h2>
            <ul className={estilos.serviciosList}>
              <li>
                <strong>Observaciones públicas</strong> con telescopios del
                observatorio.
              </li>
              <li>
                <strong>Talleres y conferencias</strong> de divulgación astronómica
                para la comunidad.
              </li>
              <li>
                <strong>Espacios de formación</strong> para estudiantes del ITM y
                semilleros de investigación.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className={estilos.bannerTelescopios}>
        <span className={estilos.bannerIconWrap}>
          <Telescope className={estilos.bannerIcon} aria-hidden="true" />
        </span>
        <p className={estilos.bannerText}>
          ¿Listo para mirar el cielo con nosotros? Visita la sección de{" "}
          <span className={estilos.bannerFuerte}>eventos</span> y conoce qué
          actividades tenemos preparadas.
        </p>
      </section>
    </>
  );
}