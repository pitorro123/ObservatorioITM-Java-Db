import { Star, MessageSquareHeart, CalendarDays } from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import { useEventosContext } from "../../context/EventosContext.jsx";
import { formatearFecha } from "../../utils/formato.js";
import estilos from "./Feedback.module.css";

function Estrellas({ valor }) {
  return (
    <span className={estilos.estrellasMostrar}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={estilos.estrella}
          fill={n <= Math.round(valor) ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

function TarjetaEventoFeedback({ evento, reseñas }) {
  const promedio = reseñas.reduce((acc, r) => acc + r.calificacion, 0) / reseñas.length;

  return (
    <div className={estilos.tarjetaEvento}>
      <div className={estilos.encabezadoEvento}>
        <div>
          <h2 className={estilos.nombreEvento}>{evento.titulo}</h2>
          <p className={estilos.metaEvento}>
            <CalendarDays className={estilos.iconoMeta} aria-hidden="true" />
            {formatearFecha(evento.fecha)}
          </p>
        </div>
        <div className={estilos.resumenPuntaje}>
          <Estrellas valor={promedio} />
          <span className={estilos.textoPuntaje}>
            <strong>{promedio.toFixed(1)}</strong> · {reseñas.length}{" "}
            {reseñas.length === 1 ? "reseña" : "reseñas"}
          </span>
        </div>
      </div>

      <div className={estilos.listaResenas}>
        {reseñas.map((reseña) => (
          <article key={reseña.id} className={estilos.tarjetaResena}>
            <div className={estilos.cabeceraResena}>
              <div>
                <p className={estilos.nombreResena}>{reseña.nombre}</p>
                <p className={estilos.fechaResena}>
                  {new Date(reseña.fecha).toLocaleDateString("es-CO")}
                </p>
              </div>
              <Estrellas valor={reseña.calificacion} />
            </div>
            {reseña.comentario && (
              <p className={estilos.comentarioResena}>{reseña.comentario}</p>
            )}
            {!reseña.comentario && (
              <p className={estilos.sinComentario}>Sin comentario escrito.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default function Feedback() {
  const { eventos, feedbackPorEvento } = useEventosContext();

  const eventosConFeedback = eventos.filter(
    (evento) => feedbackPorEvento(evento.id).length > 0
  );

  return (
    <div className={estilos.pagina}>
      <div className={estilos.seccionSuperior}>
        <Header rutaBreadcrumb={["Dashboard", "Feedback"]} titulo="Feedback" />
      </div>

      <div className={estilos.contenedor}>
        <div className={estilos.encabezado}>
          <h1 className={estilos.titulo}>
            <MessageSquareHeart className={estilos.iconoTitulo} aria-hidden="true" />
            Calificaciones y comentarios
          </h1>
          <p className={estilos.subtitulo}>
            Opiniones que dejan los asistentes sobre cada evento.
          </p>
        </div>

        {eventosConFeedback.length === 0 ? (
          <div className={estilos.tarjetaResumen}>
            <p>
              Aquí se mostrarán los comentarios y calificaciones de los eventos. Cuando
              los asistentes dejen su opinión, aparecerá organizada por evento.
            </p>
          </div>
        ) : (
          <div className={estilos.grid}>
            {eventosConFeedback.map((evento) => (
              <TarjetaEventoFeedback
                key={evento.id}
                evento={evento}
                reseñas={feedbackPorEvento(evento.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}