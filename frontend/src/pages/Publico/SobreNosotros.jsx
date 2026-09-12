import { Building2, Target, Eye, Mail } from "lucide-react";
import { contenidoObservatorio, equipoDocente } from "../../data/observatorio.js";
import telescopioImg from "../../assets/images/observatorio/icons/telescopio.png";
import estilos from "./SobreNosotros.module.css";

export default function SobreNosotros() {
  const observatorio = contenidoObservatorio;

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

      {/* 2. Sección del Equipo Docente / Profesores */}
      <section className={estilos.seccionProfesores}>
        <div className={estilos.headerProfesores}>
          <span className={estilos.subtituloBadge}>Equipo Académico</span>
          <h2 className={estilos.tituloProfesores}>
            Nuestros Profesores e Investigadores
          </h2>
          <p className={estilos.descripcionProfesores}>
            Conoce a los docentes y especialistas que lideran la formación,
            proyectos del semillero y las actividades de divulgación astronómica
            en el Observatorio ITM.
          </p>
        </div>

        <div className={estilos.gridProfesores}>
          {equipoDocente.map((profesor) => (
            <article key={profesor.id} className={estilos.cardProfesor}>
              <div className={estilos.headerCardProfesor} />

              <div className={estilos.fotoContainer}>
                <img
                  src={profesor.imagen}
                  alt={profesor.nombre}
                  className={estilos.fotoProfesor}
                  loading="lazy"
                />
                <span className={estilos.badgeCargo}>{profesor.badge}</span>
              </div>

              <div className={estilos.infoProfesor}>
                <h3 className={estilos.nombreProfesor}>{profesor.nombre}</h3>
                <p className={estilos.cargoProfesor}>{profesor.cargo}</p>
                <p className={estilos.tituloProfesor}>{profesor.tituloAcademico}</p>

                <p className={estilos.bioProfesor}>{profesor.descripcion}</p>

                <div className={estilos.especialidadesWrap}>
                  <span className={estilos.labelEspecialidades}>
                    Áreas de especialidad:
                  </span>
                  <div className={estilos.tagsWrap}>
                    {profesor.especialidades.map((esp) => (
                      <span key={esp} className={estilos.tagEspecialidad}>
                        {esp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={estilos.footerProfesor}>
                  <a
                    href={`mailto:${profesor.correo}`}
                    className={estilos.contactoLink}
                    title={`Escribir a ${profesor.nombre}`}
                  >
                    <Mail className={estilos.iconoMail} aria-hidden="true" />
                    <span>{profesor.correo}</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={estilos.bannerTelescopios}>
        <span className={estilos.bannerIconWrap}>
          <img
            src={telescopioImg}
            alt="Telescopio del Observatorio"
            className={estilos.bannerImg}
          />
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