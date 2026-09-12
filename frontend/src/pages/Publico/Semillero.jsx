import {
  GraduationCap,
  Telescope,
  BookOpen,
  Users,
  ArrowUpRight,
} from "lucide-react";
import Button from "../../components/common/Button/Button.jsx";
import { contenidoSemillero } from "../../data/observatorio.js";
import nebulosaImg from "../../assets/images/observatorio/semillero/astronomia-nebulosa.jpg";
import viaLacteaImg from "../../assets/images/observatorio/semillero/via-lactea-estrellas.jpg";
import estilos from "./Semillero.module.css";

const pilares = [
  {
    icon: Telescope,
    titulo: "Práctica observacional",
    descripcion:
      "Sesiones guiadas de observación con telescopios y equipos del observatorio.",
  },
  {
    icon: BookOpen,
    titulo: "Formación teórica",
    descripcion:
      "Fundamentos de astronomía, astrofísica y métodos de investigación.",
  },
  {
    icon: Users,
    titulo: "Comunidad activa",
    descripcion:
      "Grupo de estudiantes y docentes que participan en proyectos y encuentros.",
  },
];

const ENLACE_WHATSAPP =
  "https://chat.whatsapp.com/EkD8YCVivoCKufp250O8b2?s=cl&p=a&mlu=4&ilr=4";

export default function Semillero() {
  const semillero = contenidoSemillero;

  return (
    <>
      <section className={estilos.primeraFila}>
        {/* Columna Izquierda: Tarjeta Hero + Galería de fotos */}
        <div className={estilos.columnaHero}>
          <article className={estilos.heroCard}>
            <span className={estilos.heroIconWrap}>
              <GraduationCap className={estilos.heroIcon} aria-hidden="true" />
            </span>
            <div className={estilos.heroContent}>
              <h1 className={estilos.heroTitle}>{semillero.titulo}</h1>
              <p className={estilos.heroDescription}>{semillero.descripcion}</p>
              <Button to="/eventos" variant="ghost" className={estilos.heroBtn}>
                Ver próximas actividades
              </Button>
            </div>
          </article>

          {/* 2 imágenes de astronomía y estrellas debajo de la tarjeta */}
          <div className={estilos.galeriaHero}>
            <div className={estilos.imagenWrap}>
              <img
                src={nebulosaImg}
                alt="Nebulosa cósmica del espacio profundo"
                className={estilos.imagenSemillero}
                loading="lazy"
              />
              <span className={estilos.imagenPie}>Nebulosa y formación estelar</span>
            </div>
            <div className={estilos.imagenWrap}>
              <img
                src={viaLacteaImg}
                alt="Cielo nocturno y estrellas de la Vía Láctea"
                className={estilos.imagenSemillero}
                loading="lazy"
              />
              <span className={estilos.imagenPie}>Cielo nocturno y Vía Láctea</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Pilares/Objetivos + Comunidad de WhatsApp */}
        <div className={estilos.columnaDerecha}>
          <div className={estilos.pilaresBox}>
            <div className={estilos.pilaresGrid}>
              {pilares.map((pilar) => (
                <div key={pilar.titulo} className={estilos.pilarCard}>
                  <span className={estilos.pilarIconWrap}>
                    <pilar.icon className={estilos.pilarIcon} aria-hidden="true" />
                  </span>
                  <div className={estilos.pilarContent}>
                    <h2 className={estilos.pilarTitle}>{pilar.titulo}</h2>
                    <p className={estilos.pilarDescription}>{pilar.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={estilos.objetivosCard}>
              <h2 className={estilos.objetivosTitle}>Objetivos del semillero</h2>
              <ul className={estilos.objetivosList}>
                {semillero.objetivos.map((objetivo) => (
                  <li key={objetivo} className={estilos.objetivoItem}>
                    <span className={estilos.objetivoBala} aria-hidden="true" />
                    <span>{objetivo}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comunidad en WhatsApp (Sobrio e integrado) */}
          <div className={estilos.comunidadBox}>
            <div className={estilos.comunidadHeader}>
              <span className={estilos.comunidadIconWrap}>
                <svg
                  className={estilos.comunidadIcon}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
                </svg>
              </span>
              <div className={estilos.comunidadHeaderText}>
                <h3 className={estilos.comunidadTitle}>
                  ¿Quieres estar más cerca de nuestros eventos?
                </h3>
                <span className={estilos.comunidadSubtitulo}>
                  Comunidad del Observatorio ITM
                </span>
              </div>
            </div>

            <p className={estilos.comunidadDescription}>
              Únete a nuestro grupo de WhatsApp para enterarte de primera mano sobre observaciones astronómicas, cupos para talleres y todas las actividades abiertas a la comunidad.
            </p>

            <a
              href={ENLACE_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className={estilos.botonWhatsapp}
              aria-label="Unirse al grupo de WhatsApp del Observatorio ITM"
            >
              <svg
                className={estilos.botonWhatsappIcon}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413Z"/>
              </svg>
              <span>Unirme al grupo de WhatsApp</span>
              <ArrowUpRight className={estilos.botonWhatsappFlecha} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}