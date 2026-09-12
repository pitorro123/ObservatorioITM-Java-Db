import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  KeyRound,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  CalendarDays,
  MapPin,
  BadgeCheck,
  FileText,
  GraduationCap,
  Clock,
  CloudRain,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import BuscadorSelect from "../../components/common/BuscadorSelect/BuscadorSelect.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import { useEventosContext } from "../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../utils/formato.js";
import estilos from "./ValidarAsistencia.module.css";

export default function ValidarAsistencia() {
  const {
    eventos,
    obtenerEvento,
    obtenerInscripcion,
    marcarAsistencia,
    inscripcionesPorEvento,
  } = useEventosContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const eventoParam = searchParams.get("evento");

  const [eventoId, setEventoId] = useState(
    eventoParam || eventos[0]?.id || ""
  );
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [tipoResultado, setTipoResultado] = useState("");
  const [ingresos, setIngresos] = useState([]);
  const [notificacion, setNotificacion] = useState("");

  const eventoSeleccionado = useMemo(() => {
    return eventos.find((e) => String(e.id) === String(eventoId)) || null;
  }, [eventos, eventoId]);

  const inscritosEvento = useMemo(() => {
    return eventoId ? inscripcionesPorEvento(eventoId) : [];
  }, [eventoId, inscripcionesPorEvento]);

  const totalInscritos = inscritosEvento.length;
  const totalAsistentes = useMemo(() => {
    return inscritosEvento.filter((i) => i.asistencia === "Asistió").length;
  }, [inscritosEvento]);

  const cambiarEvento = (nuevoId) => {
    setEventoId(nuevoId);
    setSearchParams(nuevoId ? { evento: nuevoId } : {});
    setResultado(null);
    setTipoResultado("");
    setCodigo("");
  };

  const validarCodigo = (texto, idTarget = eventoId) => {
    if (!idTarget) {
      setNotificacion("Por favor selecciona un evento primero.");
      return;
    }

    const verificar = obtenerInscripcion(texto, idTarget);
    if (!verificar.exito) {
      setResultado({
        inscripcion: verificar.inscripcion || null,
        error: verificar.error,
        otroEvento: verificar.otroEvento || null,
      });
      setTipoResultado("error");
      setNotificacion(verificar.error);
      return;
    }

    const evento = obtenerEvento(verificar.inscripcion.eventoId);
    setResultado({
      inscripcion: verificar.inscripcion,
      evento,
      mensaje: verificar.error,
    });
    setTipoResultado("encontrado");
    setCodigo("");
  };

  const manejarValidar = (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    validarCodigo(codigo.trim());
  };

  const manejarConfirmar = () => {
    if (!resultado || !resultado.inscripcion) return;
    const clave =
      resultado.inscripcion.id ||
      resultado.inscripcion.codigo ||
      resultado.inscripcion.correo ||
      resultado.inscripcion.numeroDocumento;

    const marcado = marcarAsistencia(clave, eventoId);
    if (!marcado.exito) {
      setNotificacion(marcado.error);
      setTipoResultado("error");
      return;
    }

    setIngresos((prev) => [marcado.inscripcion, ...prev]);
    setTipoResultado("confirmado");
    setNotificacion(`Asistencia confirmada para ${marcado.inscripcion.nombre}.`);
  };

  const inscripcionVisible = resultado?.inscripcion;
  const eventoVisible = resultado?.evento;

  return (
    <div className={estilos.pagina}>
      <div className={estilos.seccionSuperior}>
        <Header
          rutaBreadcrumb={["Dashboard", "Validar Asistencia"]}
          titulo="Validar código de asistencia"
        />
      </div>

      <div className={estilos.contenedor}>
        {/* 1. Selector de Evento */}
        <div className={estilos.tarjetaSeleccionEvento}>
          <label className={estilos.etiquetaEvento} htmlFor="evento-validador">
            <CalendarDays className={estilos.iconoEtiqueta} aria-hidden="true" />
            <span>Selecciona el evento para validar asistencia</span>
          </label>
          <BuscadorSelect
            opciones={eventos.map((ev) => {
              const inscritos = inscripcionesPorEvento(ev.id);
              const asistieron = inscritos.filter((i) => i.asistencia === "Asistió").length;
              return {
                valor: ev.id,
                etiqueta: `${ev.titulo} · (${asistieron}/${inscritos.length} asistieron)`,
              };
            })}
            valor={eventoId}
            onCambio={cambiarEvento}
            placeholder="Selecciona el evento a validar..."
          />
        </div>

        {/* 2. Resumen del Evento Seleccionado */}
        {eventoSeleccionado && (
          <div className={estilos.resumenEventoSeleccionado}>
            <div className={estilos.infoEvento}>
              <div className={estilos.cabeceraEvento}>
                <h2 className={estilos.tituloEvento}>{eventoSeleccionado.titulo}</h2>
                <span
                  className={`${estilos.badgeEstado} ${
                    eventoSeleccionado.estado === "publicado"
                      ? estilos.badgePublicado
                      : eventoSeleccionado.estado === "cancelado"
                        ? estilos.badgeCancelado
                        : estilos.badgeBorrador
                  }`}
                >
                  {eventoSeleccionado.estado === "publicado"
                    ? "Publicado"
                    : eventoSeleccionado.estado === "cancelado"
                      ? "Cancelado"
                      : "Borrador"}
                </span>
                <span className={estilos.badgeTipo}>
                  {eventoSeleccionado.tipo === "charla"
                    ? "Charla"
                    : eventoSeleccionado.tipo === "observacion"
                      ? "Observación"
                      : "Abierto al público"}
                </span>
              </div>

              <div className={estilos.metaEvento}>
                <span className={estilos.metaItem}>
                  <CalendarDays className={estilos.metaIcono} aria-hidden="true" />
                  {formatearFecha(eventoSeleccionado.fecha)}
                </span>
                <span className={estilos.metaItem}>
                  <Clock className={estilos.metaIcono} aria-hidden="true" />
                  {formatearHora(eventoSeleccionado.hora)}
                </span>
                <span className={estilos.metaItem}>
                  <MapPin className={estilos.metaIcono} aria-hidden="true" />
                  {eventoSeleccionado.lugar}
                </span>
              </div>

              {eventoSeleccionado.estado === "cancelado" && (
                <div className={estilos.avisoEventoCancelado}>
                  <CloudRain className={estilos.iconoAvisoCancelado} aria-hidden="true" />
                  <span>
                    Evento cancelado por el docente por condiciones climáticas. Las asistencias pueden validarse si se ejecutó sesión bajo techo.
                  </span>
                </div>
              )}
            </div>

            <div className={estilos.metricasEvento}>
              <div className={estilos.metricaCard}>
                <span className={estilos.metricaValor}>{totalInscritos}</span>
                <span className={estilos.metricaEtiqueta}>Inscritos</span>
              </div>
              <div className={estilos.metricaCard}>
                <span className={`${estilos.metricaValor} ${estilos.metricaValorAsistieron}`}>
                  {totalAsistentes}
                </span>
                <span className={estilos.metricaEtiqueta}>Asistieron</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Formulario de Validación para el Evento Seleccionado */}
        <div className={estilos.tarjetaEscaner}>
          <span className={estilos.iconoEscanerWrap}>
            <KeyRound className={estilos.iconoEscaner} aria-hidden="true" />
          </span>
          <form className={estilos.formulario} onSubmit={manejarValidar}>
            <label className={estilos.etiqueta} htmlFor="codigo-validacion">
              Validar participante en{" "}
              <strong>{eventoSeleccionado ? `"${eventoSeleccionado.titulo}"` : "el evento"}</strong>
            </label>
            <div className={estilos.filaInput}>
              <input
                id="codigo-validacion"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className={estilos.input}
                placeholder="Ej: 4829, 1020304050 o correo@ejemplo.com"
                autoComplete="off"
              />
              <button type="submit" className={estilos.botonBuscar}>
                <Search className={estilos.iconoBoton} aria-hidden="true" />
                Validar
              </button>
            </div>
            <div className={estilos.barra_opciones}>
              <p className={estilos.ayuda}>
                Ingresa el código numérico de 4 dígitos, documento de identidad o correo registrado del participante para validar su asistencia a este evento.
              </p>
            </div>
          </form>
        </div>

        {/* 4. Resultado encontrado */}
        {tipoResultado === "encontrado" && inscripcionVisible && eventoVisible && (
          <div className={estilos.tarjetaResultado} role="status">
            <div className={estilos.codigoWrap}>
              {inscripcionVisible.codigo ? (
                <>
                  <span className={estilos.codigoWrapTitulo}>Código de acceso</span>
                  <div className={estilos.digitosGrid}>
                    {String(inscripcionVisible.codigo)
                      .split("")
                      .map((digito, i) => (
                        <span key={i} className={estilos.digitoCaja}>
                          {digito}
                        </span>
                      ))}
                  </div>
                </>
              ) : (
                <span className={estilos.badgeEventoMasivo}>
                  Evento Masivo · Libre
                </span>
              )}
            </div>

            <div className={estilos.datosResultado}>
              <span className={estilos.badgeEncontrado}>
                <CheckCircle2 className={estilos.iconoBadge} aria-hidden="true" />
                Participante encontrado para este evento
              </span>
              <h2 className={estilos.nombre}>{inscripcionVisible.nombre}</h2>

              <ul className={estilos.meta}>
                {inscripcionVisible.numeroDocumento && (
                  <li>
                    <FileText className={estilos.iconoMeta} aria-hidden="true" />
                    <span>
                      <strong>{inscripcionVisible.tipoDocumento || "CC"}:</strong> {inscripcionVisible.numeroDocumento}
                    </span>
                  </li>
                )}
                <li>
                  <GraduationCap className={estilos.iconoMeta} aria-hidden="true" />
                  <span>
                    <strong>Relación:</strong> {inscripcionVisible.relacionUniversidad || "Externo"}
                    {inscripcionVisible.programaAcademico ? ` (${inscripcionVisible.programaAcademico})` : ""}
                  </span>
                </li>
                <li>
                  <User className={estilos.iconoMeta} aria-hidden="true" />
                  <span>
                    {inscripcionVisible.correo}
                    {inscripcionVisible.telefono ? ` · Tel: ${inscripcionVisible.telefono}` : ""}
                  </span>
                </li>
                <li>
                  <CalendarDays className={estilos.iconoMeta} aria-hidden="true" />
                  {formatearFecha(eventoVisible.fecha)} · {formatearHora(eventoVisible.hora)}
                </li>
                <li>
                  <MapPin className={estilos.iconoMeta} aria-hidden="true" />
                  {eventoVisible.lugar}
                </li>
              </ul>

              <button
                type="button"
                className={estilos.botonConfirmar}
                onClick={manejarConfirmar}
              >
                <BadgeCheck className={estilos.iconoBoton} aria-hidden="true" />
                Confirmar asistencia
              </button>
            </div>
          </div>
        )}

        {/* 5. Éxito confirmado */}
        {tipoResultado === "confirmado" && inscripcionVisible && (
          <div className={estilos.exito} role="status">
            <CheckCircle2 className={estilos.iconoExito} aria-hidden="true" />
            <h2 className={estilos.tituloExito}>
              ¡Asistencia registrada con éxito!
            </h2>
            <p className={estilos.textoExito}>
              La asistencia de <strong>{inscripcionVisible.nombre}</strong> fue confirmada
              correctamente para <strong>{eventoSeleccionado?.titulo || "el evento"}</strong>.
            </p>
          </div>
        )}

        {/* 6. Error o alerta */}
        {tipoResultado === "error" && (
          <div className={estilos.error} role="alert">
            {resultado?.otroEvento ? (
              <AlertTriangle className={estilos.iconoAlertaOtroEvento} aria-hidden="true" />
            ) : resultado?.inscripcion ? (
              <AlertTriangle className={estilos.iconoError} aria-hidden="true" />
            ) : (
              <XCircle className={estilos.iconoError} aria-hidden="true" />
            )}
            <div className={estilos.contenidoError}>
              <h2 className={estilos.tituloError}>
                {resultado?.otroEvento
                  ? "Participante registrado en otro evento"
                  : resultado?.inscripcion
                    ? "Este registro ya fue validado"
                    : "Registro no encontrado"}
              </h2>
              <p className={estilos.textoError}>{resultado?.error}</p>

              {resultado?.otroEvento && (
                <div className={estilos.cajaOtroEventoAccion}>
                  <p className={estilos.textoOtroEvento}>
                    El participante está inscrito en: <strong>{resultado.otroEvento.titulo}</strong> ({formatearFecha(resultado.otroEvento.fecha)} · {formatearHora(resultado.otroEvento.hora)}).
                  </p>
                  <button
                    type="button"
                    className={estilos.botonCambiarEvento}
                    onClick={() => {
                      const idOtro = resultado.otroEvento.id;
                      const termino =
                        resultado.inscripcion?.codigo ||
                        resultado.inscripcion?.numeroDocumento ||
                        resultado.inscripcion?.correo;
                      cambiarEvento(idOtro);
                      if (termino) {
                        validarCodigo(termino, idOtro);
                      }
                    }}
                  >
                    <span>Cambiar al evento "{resultado.otroEvento.titulo}" y validar</span>
                    <ArrowRight className={estilos.iconoBotonMini} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. Asistencias confirmadas en este evento */}
        {eventoSeleccionado && (
          <div className={estilos.seccionIngresos}>
            <div className={estilos.cabeceraSeccionIngresos}>
              <h2 className={estilos.tituloIngresos}>
                Asistencias registradas en este evento ({totalAsistentes} de {totalInscritos})
              </h2>
              {ingresos.filter((i) => i.eventoId === eventoSeleccionado.id).length > 0 && (
                <span className={estilos.badgeSesionActual}>
                  +{ingresos.filter((i) => i.eventoId === eventoSeleccionado.id).length} en esta sesión
                </span>
              )}
            </div>

            {inscritosEvento.filter((i) => i.asistencia === "Asistió").length === 0 ? (
              <p className={estilos.sinAsistencias}>
                Aún no hay asistencias confirmadas para este evento.
              </p>
            ) : (
              <ul className={estilos.listaIngresos}>
                {inscritosEvento
                  .filter((i) => i.asistencia === "Asistió")
                  .map((inscripcion) => (
                    <li
                      key={inscripcion.id || inscripcion.codigo}
                      className={estilos.filaIngreso}
                    >
                      <BadgeCheck className={estilos.iconoIngreso} aria-hidden="true" />
                      <div className={estilos.columnaNombre}>
                        <span className={estilos.nombreIngreso}>{inscripcion.nombre}</span>
                        <span className={estilos.metaIngreso}>
                          {inscripcion.relacionUniversidad || "Externo"}
                          {inscripcion.numeroDocumento ? ` · Doc: ${inscripcion.numeroDocumento}` : ""}
                        </span>
                      </div>
                      <code className={estilos.codigoIngreso}>
                        {inscripcion.codigo ? `Código: ${inscripcion.codigo}` : "Aforo libre"}
                      </code>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <Notificacion mensaje={notificacion} onCerrar={() => setNotificacion("")} />
    </div>
  );
}