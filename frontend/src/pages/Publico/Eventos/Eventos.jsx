import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Clock, CalendarDays, MapPin } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import { useEventosContext } from "../../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../../utils/formato.js";
import estilos from "./Eventos.module.css";

export default function Eventos() {
  const { eventosPublicados } = useEventosContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtro, setFiltro] = useState(searchParams.get("tipo") || "todos");

  const filtros = [
    { clave: "todos", etiqueta: "Todos", conteo: eventosPublicados.length },
    {
      clave: "semillero",
      etiqueta: "Semillero",
      conteo: eventosPublicados.filter((e) => e.tipo === "semillero").length,
    },
    {
      clave: "abierto",
      etiqueta: "Abiertos a la comunidad",
      conteo: eventosPublicados.filter((e) => e.tipo === "abierto").length,
    },
  ];

  const cambiarFiltro = (clave) => {
    setFiltro(clave);
    setSearchParams(clave === "todos" ? {} : { tipo: clave }, { replace: true });
  };

  const eventosVisibles =
    filtro === "todos"
      ? eventosPublicados
      : eventosPublicados.filter((e) => e.tipo === filtro);

  return (
    <section className={estilos.raiz}>
      <h1 className={estilos.title}>Eventos</h1>
      <p className={estilos.subtitle}>
        Consulta el calendario de observaciones, conferencias y talleres abiertos a
        la comunidad.
      </p>

      <div className={estilos.filtros} role="tablist" aria-label="Filtrar eventos">
        {filtros.map((f) => {
          const activo = filtro === f.clave;
          return (
            <button
              key={f.clave}
              type="button"
              role="tab"
              aria-selected={activo}
              className={activo ? `${estilos.filtro} ${estilos.filtroActivo}` : estilos.filtro}
              onClick={() => cambiarFiltro(f.clave)}
            >
              {f.etiqueta} ({f.conteo})
            </button>
          );
        })}
      </div>

      {eventosVisibles.length === 0 ? (
        <p className={estilos.sinEventos}>
          No hay eventos de esta categoría por el momento.
        </p>
      ) : (
        <div className={estilos.grid}>
          {eventosVisibles.map((evento) => (
            <article key={evento.id} className={estilos.card}>
              {evento.imagen && (
                <div className={estilos.cardImageWrap}>
                  <img
                    src={evento.imagen}
                    alt={evento.titulo}
                    className={estilos.cardImage}
                  />
                  {evento.tipo === "semillero" && (
                    <span className={estilos.badgeSemillero}>Semillero</span>
                  )}
                </div>
              )}
              <div className={estilos.cardBody}>
                <h2 className={estilos.cardTitle}>{evento.titulo}</h2>
                <p className={estilos.cardDesc}>{evento.descripcion}</p>

                <ul className={estilos.cardMeta}>
                  <li className={estilos.metaItem}>
                    <Clock className={estilos.metaIcon} aria-hidden="true" />
                    {formatearHora(evento.hora)}
                  </li>
                  <li className={estilos.metaItem}>
                    <CalendarDays className={estilos.metaIcon} aria-hidden="true" />
                    {formatearFecha(evento.fecha)}
                  </li>
                  <li className={estilos.metaItem}>
                    <MapPin className={estilos.metaIcon} aria-hidden="true" />
                    {evento.lugar}
                  </li>
                </ul>

                <Button to={`/eventos/${evento.id}`} variant="primary" className={estilos.cardBtn}>
                  Ver detalle
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}