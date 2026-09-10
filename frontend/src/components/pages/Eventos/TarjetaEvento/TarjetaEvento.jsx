import { Trash2, Pencil, Send, XCircle } from "lucide-react";
import { formatearFechaCorta, formatearHora } from "../../../../utils/formato.js";
import estilos from "./TarjetaEvento.module.css";

const clasesEstado = {
  publicado: estilos.estadoPublicado,
  borrador: estilos.estadoBorrador,
  cancelado: estilos.estadoCancelado,
};

const etiquetasEstado = {
  publicado: "Publicado",
  borrador: "Borrador",
  cancelado: "Cancelado",
};

export default function TarjetaEvento({
  evento,
  onEditar,
  onEliminar,
  onPublicar,
  onCancelar,
}) {
  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.contenedorImagen}>
        <img
          src={evento.imagen}
          alt={evento.titulo}
          className={estilos.imagen}
          loading="lazy"
        />
        <span className={`${estilos.insignia} ${clasesEstado[evento.estado] || ""}`}>
          <span className={estilos.puntoEstado} aria-hidden="true" />
          {etiquetasEstado[evento.estado] || evento.estado}
        </span>
        {evento.tipo === "semillero" && (
          <span className={estilos.insigniaSemillero}>Semillero</span>
        )}
      </div>

      <div className={estilos.cuerpo}>
        <p className={estilos.fecha}>
          {formatearFechaCorta(evento.fecha)} · {formatearHora(evento.hora)}
        </p>
        <h3 className={estilos.titulo}>{evento.titulo}</h3>
        <p className={estilos.descripcion}>{evento.descripcion}</p>
      </div>

      <div className={estilos.acciones}>
        {evento.estado === "borrador" && (
          <button
            type="button"
            className={`${estilos.botonAccion} ${estilos.botonPublicar}`}
            onClick={() => onPublicar?.(evento)}
          >
            <Send className={estilos.iconoAccion} aria-hidden="true" />
            Publicar
            <span className={estilos.tooltip}>Publicar evento en el portal</span>
          </button>
        )}

        <button
          type="button"
          className={`${estilos.botonIcono} ${estilos.botonEditar}`}
          onClick={() => onEditar?.(evento)}
          aria-label="Editar evento"
        >
          <Pencil className={estilos.iconoAccion} aria-hidden="true" />
          <span className={estilos.tooltip}>Editar evento</span>
        </button>

        {evento.estado !== "cancelado" && (
          <button
            type="button"
            className={`${estilos.botonIcono} ${estilos.botonCancelar}`}
            onClick={() => onCancelar?.(evento)}
            aria-label="Cancelar evento"
          >
            <XCircle className={estilos.iconoAccion} aria-hidden="true" />
            <span className={estilos.tooltip}>Cancelar evento</span>
          </button>
        )}

        <button
          type="button"
          className={`${estilos.botonIcono} ${estilos.botonEliminar}`}
          onClick={() => onEliminar?.(evento)}
          aria-label="Eliminar evento"
        >
          <Trash2 className={estilos.iconoAccion} aria-hidden="true" />
          <span className={estilos.tooltip}>Eliminar evento</span>
        </button>
      </div>
    </article>
  );
}