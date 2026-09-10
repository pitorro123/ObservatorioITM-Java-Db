import { GraduationCap, Telescope, BookOpen, Users } from "lucide-react";
import Button from "../../components/common/Button/Button.jsx";
import { useContenido } from "../../context/ContenidoContext.jsx";
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

export default function Semillero() {
  const { semillero } = useContenido();

  return (
    <>
      <section className={estilos.primeraFila}>
        <article className={estilos.heroCard}>
          <span className={estilos.heroIconWrap}>
            <GraduationCap className={estilos.heroIcon} aria-hidden="true" />
          </span>
          <div className={estilos.heroContent}>
            <h1 className={estilos.heroTitle}>{semillero.titulo}</h1>
            <p className={estilos.heroDescription}>{semillero.descripcion}</p>
            <Button to="/eventos?tipo=semillero" variant="ghost" className={estilos.heroBtn}>
              Ver próximas actividades
            </Button>
          </div>
        </article>

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
      </section>
    </>
  );
}