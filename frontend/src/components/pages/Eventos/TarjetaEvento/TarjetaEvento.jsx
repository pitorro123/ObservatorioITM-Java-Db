import { useState } from "react";
import {
  Trash2,
  Pencil,
  Send,
  XCircle,
  Users,
  GraduationCap,
  Lock,
  QrCode,
  FileSpreadsheet,
} from "lucide-react";
import { formatearFechaCorta, formatearHora } from "../../../../utils/formato.js";
import { useAuth } from "../../../../context/AuthContext.jsx";
import { IMAGENES } from "../../../../data/imagenes.js";
import { listarInscripcionesEvento } from "../../../../api/servicios.js";
import { exportarExcelFG031 } from "../../../../utils/exportarExcelFG031.js";
import ModalQrAsistencia from "../../../common/ModalQrAsistencia/ModalQrAsistencia.jsx";
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
  const { usuarioActual, esAdmin } = useAuth();
  const esAutor = usuarioActual ? Number(usuarioActual.id) === Number(evento.creadoPorId) : false;
  const puedeGestionar = esAdmin || esAutor;

  const [mostrarQr, setMostrarQr] = useState(false);
  const [descargandoExcel, setDescargandoExcel] = useState(false);

  const manejarDescargarExcel = async (e) => {
    e.stopPropagation();
    if (descargandoExcel) return;
    setDescargandoExcel(true);
    try {
      const res = await listarInscripcionesEvento(evento.id);
      const lista = Array.isArray(res) ? res : res?.data || [];
      exportarExcelFG031(evento, lista);
    } catch (err) {
      console.error("Error al exportar FG 031:", err);
    } finally {
      setDescargandoExcel(false);
    }
  };

  const manejarAbrirQr = (e) => {
    e.stopPropagation();
    setMostrarQr(true);
  };

  return (
    <article className={estilos.tarjeta}>
      <div className={estilos.contenedorImagen}>
        <img
          src={evento.imagen || IMAGENES.GENERAL.DEFAULT_EVENTO}
          alt={evento.titulo}
          className={estilos.imagen}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = IMAGENES.GENERAL.DEFAULT_EVENTO;
          }}
        />
        <span className={`${estilos.insignia} ${clasesEstado[evento.estado] || ""}`}>
          <span className={estilos.puntoEstado} aria-hidden="true" />
          {etiquetasEstado[evento.estado] || evento.estado}
        </span>
        <span
          className={`${estilos.insigniaTipo} ${
            estilos[`insigniaTipo_${evento.tipo}`] || estilos.insigniaTipo_abierto
          }`}
        >
          {evento.tipo === "charla"
            ? "Charla"
            : evento.tipo === "observacion"
              ? "Observación"
              : "Abierto"}
        </span>
        {evento.esMasivo && (
          <span className={estilos.insigniaMasivo}>
            Aforo libre
          </span>
        )}
      </div>

      <div className={estilos.cuerpo}>
        <div className={estilos.metaCabecera}>
          <p className={estilos.fecha}>
            {formatearFechaCorta(evento.fecha)} · {formatearHora(evento.hora)}
          </p>
          <span
            className={`${estilos.capacidadBadge} ${
              evento.esMasivo ? estilos.capacidadBadgeMasivo : ""
            }`}
            title={
              evento.esMasivo
                ? "Evento masivo (Aforo libre e ilimitado)"
                : "Inscritos / Capacidad total"
            }
          >
            <Users className={estilos.iconoCapacidad} aria-hidden="true" />
            {evento.esMasivo
              ? `${evento.inscritos || 0} / Ilimitado`
              : `${evento.inscritos || 0}/${evento.capacidad || 50}`}
          </span>
        </div>

        <div className={estilos.docenteTag}>
          <GraduationCap className={estilos.iconoDocente} aria-hidden="true" />
          <span className={estilos.docenteTexto}>
            Docente: <strong>{evento.creadoPorNombre || "Docente ITM"}</strong>
          </span>
        </div>

        <h3 className={estilos.titulo}>{evento.titulo}</h3>
        <p className={estilos.descripcion}>{evento.descripcion}</p>
      </div>

      <div className={estilos.acciones}>
        {evento.esMasivo && (
          <button
            type="button"
            className={`${estilos.botonIcono} ${estilos.botonQr}`}
            onClick={manejarAbrirQr}
            aria-label="Ver y proyectar código QR de asistencia"
          >
            <QrCode className={estilos.iconoAccion} aria-hidden="true" />
            <span className={estilos.tooltip}>QR Asistencia en sitio</span>
          </button>
        )}

        <button
          type="button"
          className={`${estilos.botonIcono} ${estilos.botonExcel}`}
          onClick={manejarDescargarExcel}
          disabled={descargandoExcel}
          aria-label="Descargar listado de asistencia FG 031"
        >
          <FileSpreadsheet className={estilos.iconoAccion} aria-hidden="true" />
          <span className={estilos.tooltip}>
            {descargandoExcel ? "Generando Excel..." : "Descargar lista FG 031"}
          </span>
        </button>

        {puedeGestionar ? (
          <>
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
          </>
        ) : (
          <div
            className={estilos.badgeSoloLectura}
            title="Solo el docente creador o un administrador puede editar o eliminar este evento"
          >
            <Lock className={estilos.iconoCandado} aria-hidden="true" />
            <span>Solo lectura</span>
          </div>
        )}
      </div>

      <ModalQrAsistencia
        abierto={mostrarQr}
        onCerrar={() => setMostrarQr(false)}
        evento={evento}
      />
    </article>
  );
}