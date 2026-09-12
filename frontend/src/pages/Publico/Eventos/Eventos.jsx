import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Clock,
  CalendarDays,
  MapPin,
  Calendar,
  RotateCcw,
  ChevronDown,
  Users,
} from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import BuscadorSelect from "../../../components/common/BuscadorSelect/BuscadorSelect.jsx";
import ModalEventoCancelado from "../../../components/common/ModalEventoCancelado/ModalEventoCancelado.jsx";
import { useEventosContext } from "../../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../../utils/formato.js";
import estilos from "./Eventos.module.css";

/* ── Carrusel Continuo de Eventos (Movimiento de Izquierda a Derecha) ── */
function CarruselSuperior({ eventos, onAbrirCancelado }) {
  const eventosCarrusel = useMemo(() => {
    return eventos.filter((e) => e.imagen && e.estado !== "borrador");
  }, [eventos]);

  const itemsDuplicados = useMemo(() => {
    if (eventosCarrusel.length === 0) return [];
    let base = [...eventosCarrusel];
    while (base.length < 10) {
      base = [...base, ...eventosCarrusel];
    }
    return [...base, ...base];
  }, [eventosCarrusel]);

  if (eventosCarrusel.length === 0) return null;

  return (
    <div
      className={estilos.carruselHero}
      aria-label="Eventos del Observatorio en movimiento continuo de izquierda a derecha"
    >
      <div className={estilos.carruselPista}>
        {itemsDuplicados.map((evento, index) => (
          <Link
            key={`${evento.id}-${index}`}
            to={`/eventos/${evento.id}`}
            onClick={(e) => {
              if (evento.estado === "cancelado") {
                e.preventDefault();
                onAbrirCancelado?.(evento);
              }
            }}
            className={estilos.carruselCard}
            title={`Ver detalles de ${evento.titulo}`}
          >
            <img
              src={evento.imagen}
              alt={evento.titulo}
              className={estilos.carruselCardImg}
              loading="lazy"
            />
            <div className={estilos.carruselCardOverlay} />

            <div className={estilos.carruselCardBadges}>
              <span
                className={
                  evento.estado === "publicado"
                    ? estilos.badgePublicado
                    : estilos.badgeCancelado
                }
              >
                {evento.estado === "publicado" ? "Publicado" : "Cancelado"}
              </span>
              <span
                className={`${estilos.badgeTipo} ${
                  estilos[`badgeTipo_${evento.tipo}`] || estilos.badgeTipo_abierto
                }`}
              >
                {evento.tipo === "charla"
                  ? "Charla"
                  : evento.tipo === "observacion"
                    ? "Observación"
                    : "Abierto al público"}
              </span>
            </div>

            <div className={estilos.carruselCardBody}>
              <h3 className={estilos.carruselCardTitulo}>{evento.titulo}</h3>
              <div className={estilos.carruselCardMeta}>
                <span className={estilos.carruselCardMetaItem}>
                  <Calendar className={estilos.carruselCardIcono} aria-hidden="true" />
                  {formatearFecha(evento.fecha)}
                </span>
                <span className={estilos.carruselCardMetaItem}>
                  <Clock className={estilos.carruselCardIcono} aria-hidden="true" />
                  {formatearHora(evento.hora)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Eventos() {
  const { eventos } = useEventosContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de filtros
  const [eventoSeleccionadoId, setEventoSeleccionadoId] = useState(
    searchParams.get("evento") || ""
  );
  const [tipoSeleccionado, setTipoSeleccionado] = useState(
    searchParams.get("tipo") || "todos"
  );
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(
    searchParams.get("estado") || "todos"
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    searchParams.get("fecha") || ""
  );
  const [eventoCanceladoModal, setEventoCanceladoModal] = useState(null);

  // Sincronizar parámetros con la URL
  const actualizarParams = (eventoId, tipo, estado, fecha) => {
    const params = {};
    if (eventoId) params.evento = eventoId;
    if (tipo && tipo !== "todos") params.tipo = tipo;
    if (estado && estado !== "todos") params.estado = estado;
    if (fecha) params.fecha = fecha;
    setSearchParams(params, { replace: true });
  };

  const cambiarEvento = (valor) => {
    setEventoSeleccionadoId(valor);
    actualizarParams(valor, tipoSeleccionado, estadoSeleccionado, fechaSeleccionada);
  };

  const cambiarTipo = (valor) => {
    setTipoSeleccionado(valor);
    actualizarParams(eventoSeleccionadoId, valor, estadoSeleccionado, fechaSeleccionada);
  };

  const cambiarEstado = (valor) => {
    setEstadoSeleccionado(valor);
    actualizarParams(eventoSeleccionadoId, tipoSeleccionado, valor, fechaSeleccionada);
  };

  const cambiarFecha = (valor) => {
    setFechaSeleccionada(valor);
    actualizarParams(eventoSeleccionadoId, tipoSeleccionado, estadoSeleccionado, valor);
  };

  const hayFiltrosActivos =
    Boolean(eventoSeleccionadoId) ||
    tipoSeleccionado !== "todos" ||
    estadoSeleccionado !== "todos" ||
    Boolean(fechaSeleccionada);

  const limpiarFiltros = () => {
    setEventoSeleccionadoId("");
    setTipoSeleccionado("todos");
    setEstadoSeleccionado("todos");
    setFechaSeleccionada("");
    setSearchParams({}, { replace: true });
  };

  // Eventos disponibles para el público (por defecto publicados y cancelados)
  const eventosBase = useMemo(() => {
    return eventos.filter((e) => e.estado !== "borrador");
  }, [eventos]);

  // Opciones para el BuscadorSelect
  const opcionesEventos = useMemo(() => {
    return [
      { valor: "", etiqueta: "Todos los eventos" },
      ...eventosBase.map((e) => ({
        valor: String(e.id),
        etiqueta: e.titulo,
      })),
    ];
  }, [eventosBase]);

  // Filtrado de eventos
  const eventosVisibles = useMemo(() => {
    return eventosBase.filter((e) => {
      // 1. Filtro por buscador desplegable
      if (eventoSeleccionadoId && String(e.id) !== String(eventoSeleccionadoId)) {
        return false;
      }
      // 2. Filtro por tipo
      if (tipoSeleccionado !== "todos" && e.tipo !== tipoSeleccionado) {
        return false;
      }
      // 3. Filtro por estado
      if (estadoSeleccionado !== "todos" && e.estado !== estadoSeleccionado) {
        return false;
      }
      // 4. Filtro por fecha
      if (fechaSeleccionada && e.fecha !== fechaSeleccionada) {
        return false;
      }
      return true;
    });
  }, [eventosBase, eventoSeleccionadoId, tipoSeleccionado, estadoSeleccionado, fechaSeleccionada]);

  return (
    <section className={estilos.raiz}>
      {/* 1. Carrusel continuo de fotos de eventos (movimiento de izquierda a derecha) */}
      <CarruselSuperior
        eventos={eventos}
        onAbrirCancelado={(ev) => setEventoCanceladoModal(ev)}
      />

      {/* 2. Encabezado de la sección */}
      <div className={estilos.headerSeccion}>
        <h1 className={estilos.title}>Eventos</h1>
        <p className={estilos.subtitle}>
          Consulta el calendario de observaciones, conferencias y talleres abiertos a
          la comunidad.
        </p>
      </div>

      {/* 3. Apartado de Filtros Unificado */}
      <div className={estilos.barraFiltros}>
        {/* Buscador desplegable escribible */}
        <div className={estilos.campoFiltroBuscador}>
          <label className={estilos.labelFiltro}>Buscar evento:</label>
          <BuscadorSelect
            opciones={opcionesEventos}
            valor={eventoSeleccionadoId}
            onCambio={cambiarEvento}
            placeholder="Escribe o selecciona..."
          />
        </div>

        {/* Tipo de evento */}
        <div className={estilos.campoFiltro}>
          <label htmlFor="filtro-tipo" className={estilos.labelFiltro}>
            Tipo de evento:
          </label>
          <div className={estilos.selectWrap}>
            <select
              id="filtro-tipo"
              className={estilos.select}
              value={tipoSeleccionado}
              onChange={(e) => cambiarTipo(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="abierto">Abierto al público</option>
              <option value="charla">Charla</option>
              <option value="observacion">Observación</option>
            </select>
            <ChevronDown className={estilos.selectChevron} aria-hidden="true" />
          </div>
        </div>

        {/* Estado del evento */}
        <div className={estilos.campoFiltro}>
          <label htmlFor="filtro-estado" className={estilos.labelFiltro}>
            Estado:
          </label>
          <div className={estilos.selectWrap}>
            <select
              id="filtro-estado"
              className={estilos.select}
              value={estadoSeleccionado}
              onChange={(e) => cambiarEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="publicado">Publicado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <ChevronDown className={estilos.selectChevron} aria-hidden="true" />
          </div>
        </div>

        {/* Fecha con calendario */}
        <div className={estilos.campoFiltro}>
          <label htmlFor="filtro-fecha" className={estilos.labelFiltro}>
            Fecha:
          </label>
          <div
            className={estilos.campoFechaWrap}
            onClick={(e) => e.currentTarget.querySelector("input")?.showPicker?.()}
          >
            <Calendar className={estilos.iconoFecha} aria-hidden="true" />
            <input
              id="filtro-fecha"
              type="date"
              className={estilos.inputFecha}
              value={fechaSeleccionada}
              onChange={(e) => cambiarFecha(e.target.value)}
            />
          </div>
        </div>

        {/* Botón Limpiar filtros */}
        <div className={estilos.campoFiltroAccion}>
          <button
            type="button"
            className={`${estilos.btnLimpiar} ${
              hayFiltrosActivos ? estilos.btnLimpiarActivo : ""
            }`}
            onClick={limpiarFiltros}
            disabled={!hayFiltrosActivos}
            title={hayFiltrosActivos ? "Limpiar todos los filtros" : "Sin filtros aplicados"}
          >
            <RotateCcw className={estilos.iconoLimpiar} aria-hidden="true" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>

      {/* 4. Listado de eventos o estado vacío */}
      {eventosVisibles.length === 0 ? (
        <div className={estilos.sinEventos}>
          <p className={estilos.sinEventosTexto}>
            No se encontraron eventos con los filtros seleccionados.
          </p>
          {hayFiltrosActivos && (
            <button
              type="button"
              className={estilos.btnRestablecerVacio}
              onClick={limpiarFiltros}
            >
              <RotateCcw className={estilos.iconoLimpiar} aria-hidden="true" />
              Limpiar filtros y ver todos
            </button>
          )}
        </div>
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
                  {/* Badges de estado y tipo sobre la imagen */}
                  <div className={estilos.cardBadges}>
                    <span
                      className={
                        evento.estado === "publicado"
                          ? estilos.badgePublicado
                          : evento.estado === "cancelado"
                            ? estilos.badgeCancelado
                            : estilos.badgeBorrador
                      }
                    >
                      {evento.estado === "publicado"
                        ? "Publicado"
                        : evento.estado === "cancelado"
                          ? "Cancelado"
                          : "Borrador"}
                    </span>
                    <span
                      className={`${estilos.badgeTipo} ${
                        estilos[`badgeTipo_${evento.tipo}`] || estilos.badgeTipo_abierto
                      }`}
                    >
                      {evento.tipo === "charla"
                        ? "Charla"
                        : evento.tipo === "observacion"
                          ? "Observación"
                          : "Abierto al público"}
                    </span>
                  </div>
                </div>
              )}

              <div className={estilos.cardBody}>
                {/* Si no hay imagen, mostrar los badges en el encabezado de la tarjeta */}
                {!evento.imagen && (
                  <div className={estilos.cardBadgesHeader}>
                    <span
                      className={
                        evento.estado === "publicado"
                          ? estilos.badgePublicado
                          : evento.estado === "cancelado"
                            ? estilos.badgeCancelado
                            : estilos.badgeBorrador
                      }
                    >
                      {evento.estado === "publicado"
                        ? "Publicado"
                        : evento.estado === "cancelado"
                          ? "Cancelado"
                          : "Borrador"}
                    </span>
                    <span
                      className={`${estilos.badgeTipo} ${
                        estilos[`badgeTipo_${evento.tipo}`] || estilos.badgeTipo_abierto
                      }`}
                    >
                      {evento.tipo === "charla"
                        ? "Charla"
                        : evento.tipo === "observacion"
                          ? "Observación"
                          : "Abierto al público"}
                    </span>
                    {evento.esMasivo && (
                      <span className={estilos.badgeMasivo}>
                        Aforo libre
                      </span>
                    )}
                  </div>
                )}

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
                  {!evento.esMasivo && (evento.inscritos || 0) >= (evento.capacidad || 50) && (
                    <li className={`${estilos.metaItem} ${estilos.metaItemAgotado}`}>
                      <Users className={estilos.metaIcon} aria-hidden="true" />
                      No hay cupos disponibles
                    </li>
                  )}
                </ul>

                {evento.estado === "cancelado" ? (
                  <Button
                    onClick={() => setEventoCanceladoModal(evento)}
                    variant="primary"
                    className={estilos.cardBtn}
                  >
                    Ver detalle
                  </Button>
                ) : (
                  <Button
                    to={`/eventos/${evento.id}`}
                    variant="primary"
                    className={estilos.cardBtn}
                  >
                    Ver detalle
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <ModalEventoCancelado
        abierto={Boolean(eventoCanceladoModal)}
        onCerrar={() => setEventoCanceladoModal(null)}
        tituloEvento={eventoCanceladoModal?.titulo}
        motivo={eventoCanceladoModal?.motivoCancelacion || "clima"}
      />
    </section>
  );
}