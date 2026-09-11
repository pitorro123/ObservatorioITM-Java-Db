import { useState, useRef } from "react";
import Header from "../../components/layout/Header/Header.jsx";
import BarraFiltros from "../../components/pages/Eventos/BarraFiltros/BarraFiltros.jsx";
import GridEventos from "../../components/pages/Eventos/GridEventos/GridEventos.jsx";
import Paginacion from "../../components/pages/Eventos/Paginacion/Paginacion.jsx";
import FormularioEvento from "../../components/pages/Eventos/FormularioEvento/FormularioEvento.jsx";
import ConfirmacionModal from "../../components/pages/Eventos/ConfirmacionModal/ConfirmacionModal.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import { useEventos } from "../../hooks/useEventos.js";
import { useEventosContext } from "../../context/EventosContext.jsx";
import { Plus } from "lucide-react";
import estilos from "./Eventos.module.css";

export default function Eventos() {
  const { eventos, crearEvento, editarEvento, eliminarEvento, publicarEvento, cancelarEvento, conteoPorEstado } =
    useEventosContext();

  const {
    pestañaActiva,
    cambiarPestaña,
    valorBusqueda,
    cambiarBusqueda,
    filtroMes,
    cambiarFiltroMes,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    eventosPagina,
  } = useEventos(eventos);

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [eventoEliminar, setEventoEliminar] = useState(null);
  const [eventoCancelar, setEventoCancelar] = useState(null);
  const [notificacion, setNotificacion] = useState("");

  const [tooltipOculto, setTooltipOculto] = useState(false);
  const temporizadorTooltip = useRef(null);

  const mostrarTooltip = () => {
    clearTimeout(temporizadorTooltip.current);
    setTooltipOculto(false);
    temporizadorTooltip.current = setTimeout(() => setTooltipOculto(true), 2000);
  };

  const ocultarTooltip = () => {
    clearTimeout(temporizadorTooltip.current);
    setTooltipOculto(false);
  };

  const abrirCrear = () => {
    setEventoEditando(null);
    setFormularioAbierto(true);
  };

  const abrirEditar = (evento) => {
    setEventoEditando(evento);
    setFormularioAbierto(true);
  };

  const manejarGuardar = (datos) => {
    if (eventoEditando) {
      editarEvento(eventoEditando.id, datos);
      setNotificacion("Evento actualizado correctamente.");
    } else {
      crearEvento(datos);
      setNotificacion("Evento creado correctamente.");
      setPaginaActual(1);
    }
    setFormularioAbierto(false);
    setEventoEditando(null);
  };

  const manejarEliminar = () => {
    if (eventoEliminar) {
      eliminarEvento(eventoEliminar.id);
      setNotificacion("Evento eliminado correctamente.");
    }
    setEventoEliminar(null);
  };

  const manejarPublicar = (evento) => {
    publicarEvento(evento.id);
    setNotificacion(`"${evento.titulo}" publicado en el portal.`);
  };

  const manejarCancelar = () => {
    if (eventoCancelar) {
      cancelarEvento(eventoCancelar.id);
      setNotificacion(`"${eventoCancelar.titulo}" cancelado.`);
    }
    setEventoCancelar(null);
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.seccionSuperior}>
        <Header rutaBreadcrumb={["Dashboard", "Eventos"]} titulo="Eventos" />

        <BarraFiltros
          conteos={conteoPorEstado}
          pestañaActiva={pestañaActiva}
          onCambiarPestaña={cambiarPestaña}
          valorBusqueda={valorBusqueda}
          onCambiarBusqueda={cambiarBusqueda}
          filtroMes={filtroMes}
          onCambiarFiltroMes={cambiarFiltroMes}
        />
      </div>

      <div className={estilos.contenedorTarjetas}>
        <GridEventos
          eventos={eventosPagina}
          onEditar={abrirEditar}
          onEliminar={setEventoEliminar}
          onPublicar={manejarPublicar}
          onCancelar={setEventoCancelar}
        />
        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          onCambiarPagina={setPaginaActual}
        />
      </div>

      <button
        type="button"
        className={estilos.botonFlotante}
        aria-label="Crear evento"
        onClick={abrirCrear}
        onMouseEnter={mostrarTooltip}
        onMouseLeave={ocultarTooltip}
        onFocus={mostrarTooltip}
        onBlur={ocultarTooltip}
      >
        <Plus className={estilos.iconoPlus} aria-hidden="true" />
        <span
          className={`${estilos.tooltip} ${tooltipOculto ? estilos.tooltipOculto : ""}`}
        >
          Agregar un nuevo evento
        </span>
      </button>

      <FormularioEvento
        abierto={formularioAbierto}
        evento={eventoEditando}
        onCerrar={() => {
          setFormularioAbierto(false);
          setEventoEditando(null);
        }}
        onGuardar={manejarGuardar}
      />

      <ConfirmacionModal
        abierto={Boolean(eventoEliminar)}
        titulo="¿Eliminar este evento?"
        mensaje={
          eventoEliminar
            ? `Se eliminará "${eventoEliminar.titulo}" de forma permanente. Esta acción no se puede deshacer.`
            : ""
        }
        onCerrar={() => setEventoEliminar(null)}
        onConfirmar={manejarEliminar}
        etiquetaConfirmar="Eliminar"
      />

      <ConfirmacionModal
        abierto={Boolean(eventoCancelar)}
        titulo="¿Cancelar este evento?"
        mensaje={
          eventoCancelar
            ? `Se cancelará "${eventoCancelar.titulo}". Dejará de mostrarse en el portal público.`
            : ""
        }
        onCerrar={() => setEventoCancelar(null)}
        onConfirmar={manejarCancelar}
        etiquetaConfirmar="Cancelar evento"
      />

      <Notificacion mensaje={notificacion} onCerrar={() => setNotificacion("")} />
    </div>
  );
}