import { useState, useRef } from "react";
import Header from "../../components/layout/Header/Header.jsx";
import BarraFiltros from "../../components/pages/Eventos/BarraFiltros/BarraFiltros.jsx";
import GridEventos from "../../components/pages/Eventos/GridEventos/GridEventos.jsx";
import Paginacion from "../../components/pages/Eventos/Paginacion/Paginacion.jsx";
import FormularioEvento from "../../components/pages/Eventos/FormularioEvento/FormularioEvento.jsx";
import ConfirmacionModal from "../../components/pages/Eventos/ConfirmacionModal/ConfirmacionModal.jsx";
import ModalCancelarEvento from "../../components/pages/Eventos/ModalCancelarEvento/ModalCancelarEvento.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import { useEventos } from "../../hooks/useEventos.js";
import { useEventosContext } from "../../context/EventosContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useClima } from "../../hooks/useClima.js";
import { Plus, CloudRain } from "lucide-react";
import estilos from "./Eventos.module.css";

export default function Eventos() {
  const { usuarioActual, esAdmin } = useAuth();
  const { eventos, crearEvento, editarEvento, eliminarEvento, publicarEvento, cancelarEvento } =
    useEventosContext();
  const { estado: estadoClima } = useClima();
  const esDesfavorable = estadoClima?.observatorio?.esDesfavorable;

  const {
    pestañaActiva,
    cambiarPestaña,
    valorBusqueda,
    cambiarBusqueda,
    filtroMes,
    cambiarFiltroMes,
    filtroAutor,
    cambiarFiltroAutor,
    conteosPorEstado,
    paginaActual,
    setPaginaActual,
    totalPaginas,
    eventosPagina,
  } = useEventos(eventos, usuarioActual);

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [eventoEliminar, setEventoEliminar] = useState(null);
  const [eventoCancelar, setEventoCancelar] = useState(null);
  const [notificacion, setNotificacion] = useState("");

  const [tooltipOculto, setTooltipOculto] = useState(false);
  const temporizadorTooltip = useRef(null);

  const puedeGestionar = (evento) =>
    esAdmin || (usuarioActual && Number(usuarioActual.id) === Number(evento?.creadoPorId));

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
    if (!puedeGestionar(evento)) {
      setNotificacion("Solo el docente creador o un administrador puede editar este evento.");
      return;
    }
    setEventoEditando(evento);
    setFormularioAbierto(true);
  };

  const manejarGuardar = (datos) => {
    if (eventoEditando) {
      if (!puedeGestionar(eventoEditando)) {
        setNotificacion("No tienes permisos para modificar este evento.");
        return;
      }
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
      if (!puedeGestionar(eventoEliminar)) {
        setNotificacion("No tienes permisos para eliminar este evento.");
        setEventoEliminar(null);
        return;
      }
      eliminarEvento(eventoEliminar.id);
      setNotificacion("Evento eliminado correctamente.");
    }
    setEventoEliminar(null);
  };

  const manejarPublicar = (evento) => {
    if (!puedeGestionar(evento)) {
      setNotificacion("No tienes permisos para publicar este evento.");
      return;
    }
    publicarEvento(evento.id);
    setNotificacion(`"${evento.titulo}" publicado en el portal.`);
  };

  const manejarCancelar = (motivo = "clima") => {
    if (eventoCancelar) {
      if (!puedeGestionar(eventoCancelar)) {
        setNotificacion("No tienes permisos para cancelar este evento.");
        setEventoCancelar(null);
        return;
      }
      cancelarEvento(eventoCancelar.id, motivo);
      setNotificacion(
        `"${eventoCancelar.titulo}" cancelado por ${
          motivo === "personal" ? "asuntos personales" : "condiciones climáticas"
        }.`
      );
    }
    setEventoCancelar(null);
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.seccionSuperior}>
        <Header rutaBreadcrumb={["Dashboard", "Eventos"]} titulo="Eventos" />

        {esDesfavorable && (
          <div className={estilos.avisoClimaDocente} role="alert">
            <CloudRain className={estilos.avisoClimaIcono} aria-hidden="true" />
            <div className={estilos.avisoClimaTexto}>
              <strong>Aviso meteorológico:</strong> Clima no favorable. 
              <strong> Directriz ITM:</strong> no canceles el evento, trasládalo a aula o auditorio bajo techo.
            </div>
          </div>
        )}

        <BarraFiltros
          conteos={conteosPorEstado}
          pestañaActiva={pestañaActiva}
          onCambiarPestaña={cambiarPestaña}
          valorBusqueda={valorBusqueda}
          onCambiarBusqueda={cambiarBusqueda}
          filtroMes={filtroMes}
          onCambiarFiltroMes={cambiarFiltroMes}
          filtroAutor={filtroAutor}
          onCambiarFiltroAutor={cambiarFiltroAutor}
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

      <ModalCancelarEvento
        abierto={Boolean(eventoCancelar)}
        evento={eventoCancelar}
        onCerrar={() => setEventoCancelar(null)}
        onConfirmar={manejarCancelar}
      />

      <Notificacion mensaje={notificacion} onCerrar={() => setNotificacion("")} />
    </div>
  );
}