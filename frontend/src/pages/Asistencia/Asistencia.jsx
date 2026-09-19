import { useState, useEffect } from "react";
import {
  CalendarDays,
  Users,
  UserCheck,
  MapPin,
  Check,
  Clock,
  FileSpreadsheet,
  QrCode,
  GraduationCap,
} from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import BuscadorSelect from "../../components/common/BuscadorSelect/BuscadorSelect.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import ModalQrAsistencia from "../../components/common/ModalQrAsistencia/ModalQrAsistencia.jsx";
import { useEventosContext } from "../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../utils/formato.js";
import { exportarExcelFG031 } from "../../utils/exportarExcelFG031.js";
import estilos from "./Asistencia.module.css";

export default function Asistencia() {
  const {
    eventos,
    inscripcionesPorEvento,
    marcarAsistencia,
    obtenerInscripcion,
    cargando,
  } = useEventosContext();

  const [eventoId, setEventoId] = useState("");
  const [notificacion, setNotificacion] = useState("");
  const [marcandoId, setMarcandoId] = useState(null);
  const [modalQrAbierto, setModalQrAbierto] = useState(false);

  // Auto-seleccionar evento cuando se carguen los eventos
  useEffect(() => {
    if (!eventoId || !eventos.some((e) => Number(e.id) === Number(eventoId))) {
      if (eventos.length > 0) {
        const conInscritos = eventos.find(
          (evento) => inscripcionesPorEvento(evento.id).length > 0
        );
        setEventoId(conInscritos ? conInscritos.id : eventos[0].id);
      }
    }
  }, [eventos, eventoId, inscripcionesPorEvento]);

  const evento = eventos.find((e) => Number(e.id) === Number(eventoId));
  const eventoSeleccionado = evento;
  const inscripciones = eventoId ? inscripcionesPorEvento(eventoId) : [];
  const totalInscritos = inscripciones.length;
  const totalAsistentes = inscripciones.filter(
    (i) => i.asistencia === "Asistió"
  ).length;

  const manejarExportarExcel = () => {
    if (!evento) return;
    exportarExcelFG031(evento, inscripciones);
    setNotificacion("Descargando formato FG 031 en Excel...");
  };

  const manejarMarcar = async (identificador) => {
    if (!identificador || marcandoId) return;
    setMarcandoId(identificador);
    try {
      const resultado = await marcarAsistencia(identificador, eventoId);
      if (resultado.exito) {
        setNotificacion(
          `Asistencia registrada para ${resultado.inscripcion?.nombre || "el participante"}.`
        );
      } else {
        setNotificacion(resultado.error || "No se pudo registrar la asistencia.");
      }
    } catch (err) {
      setNotificacion(err?.mensaje || err?.message || "Error al marcar la asistencia.");
    } finally {
      setMarcandoId(null);
    }
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.seccionSuperior}>
        <Header
          rutaBreadcrumb={["Dashboard", "Asistencia"]}
          titulo="Consultar asistencia"
        />
      </div>

      <div className={estilos.contenedor}>
        <div className={estilos.filtros}>
          <label className={estilos.etiqueta} htmlFor="evento-asistencia">
            <CalendarDays className={estilos.iconoEtiqueta} aria-hidden="true" />
            Selecciona un evento
          </label>
          <BuscadorSelect
            opciones={eventos.map((eventoOption) => ({
              valor: eventoOption.id,
              etiqueta: `${eventoOption.titulo} (${inscripcionesPorEvento(eventoOption.id).length} inscritos)`,
            }))}
            valor={eventoId}
            onCambio={setEventoId}
            placeholder="Selecciona un evento"
          />
        </div>

        {evento && (
          <div className={estilos.resumenEvento}>
            <div className={estilos.datosEvento}>
              <div className={estilos.tituloFila}>
                <p className={estilos.nombreEvento}>{evento.titulo}</p>
                {evento.esMasivo && (
                  <span className={estilos.badgeMasivo}>Aforo Libre · Evento Masivo</span>
                )}
              </div>
              <p className={estilos.metaEvento}>
                {formatearFecha(evento.fecha)} · {formatearHora(evento.hora)} ·{" "}
                <MapPin className={estilos.iconoInline} aria-hidden="true" />
                {evento.lugar}
                {evento.creadoPorNombre && (
                  <>
                    {" "}· <GraduationCap className={estilos.iconoInline} aria-hidden="true" /> Docente:{" "}
                    <strong>{evento.creadoPorNombre}</strong>
                  </>
                )}
              </p>
            </div>
            <div className={estilos.contadoresYAcciones}>
              <div className={estilos.contadores}>
                <div className={estilos.contador}>
                  <Users className={estilos.iconoContador} aria-hidden="true" />
                  <span className={estilos.valorContador}>{totalInscritos}</span>
                  <span className={estilos.etiquetaContador}>Inscritos</span>
                </div>
                <div className={estilos.contador}>
                  <UserCheck className={estilos.iconoContador} aria-hidden="true" />
                  <span className={estilos.valorContador}>{totalAsistentes}</span>
                  <span className={estilos.etiquetaContador}>Asistieron</span>
                </div>
              </div>
              <div className={estilos.accionesResumen}>
                {evento.esMasivo && (
                  <button
                    type="button"
                    className={estilos.botonQrResumen}
                    onClick={() => setModalQrAbierto(true)}
                  >
                    <QrCode size={16} aria-hidden="true" />
                    QR Asistencia
                  </button>
                )}
                <button
                  type="button"
                  className={estilos.botonExcelResumen}
                  onClick={manejarExportarExcel}
                >
                  <FileSpreadsheet size={16} aria-hidden="true" />
                  Descargar FG 031 (Excel)
                </button>
              </div>
            </div>
          </div>
        )}

        {cargando && eventos.length === 0 ? (
          <div className={estilos.vacio}>
            <p>Cargando información de eventos y asistencia...</p>
          </div>
        ) : !evento ? (
          <div className={estilos.vacio}>
            <CalendarDays className={estilos.iconoVacio} aria-hidden="true" />
            <p>Selecciona un evento para consultar y gestionar su listado de asistencia.</p>
          </div>
        ) : inscripciones.length === 0 ? (
          <div className={estilos.vacio}>
            <Users className={estilos.iconoVacio} aria-hidden="true" />
            <p>
              Aún no hay inscritos para este evento. Comparte el enlace del evento para
              recibir registros.
            </p>
          </div>
        ) : (
          <div className={estilos.tablaWrap}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th>Participante</th>
                  <th>Documento</th>
                  <th>Relación ITM</th>
                  <th>Contacto</th>
                  {eventoSeleccionado?.tipo === "nasa" && <th>Logística NASA</th>}
                  <th>Código de registro</th>
                  <th>Asistencia</th>
                  <th className={estilos.columnaAccion}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {inscripciones.map((inscripcion) => {
                  const asistio = inscripcion.asistencia === "Asistió";
                  const idUnico = inscripcion.id || inscripcion.codigo;
                  const identificador =
                    inscripcion.codigo ||
                    inscripcion.numeroDocumento ||
                    inscripcion.correo ||
                    inscripcion.id;
                  const estaMarcando = marcandoId === identificador;
                  return (
                    <tr key={idUnico}>
                      <td>
                        <p className={estilos.nombreInscrito}>{inscripcion.nombre}</p>
                        <p className={estilos.metaInscrito}>
                          <Clock className={estilos.iconoInline} aria-hidden="true" />
                          Inscrito el{" "}
                          {inscripcion.fechaInscripcion
                            ? new Date(inscripcion.fechaInscripcion).toLocaleDateString(
                                "es-CO"
                              )
                            : "-"}
                        </p>
                      </td>
                      <td>
                        {inscripcion.numeroDocumento ? (
                          <span className={estilos.textoDocumento}>
                            <strong>{inscripcion.tipoDocumento || "CC"}</strong> {inscripcion.numeroDocumento}
                          </span>
                        ) : (
                          <span className={estilos.textoVacio}>-</span>
                        )}
                      </td>
                      <td>
                        <span className={estilos.badgeRelacion}>
                          {inscripcion.relacionUniversidad || "Externo"}
                        </span>
                        {inscripcion.programaAcademico && (
                          <p className={estilos.programaTexto}>
                            {inscripcion.programaAcademico}
                          </p>
                        )}
                      </td>
                      <td className={estilos.celdaCorreo}>
                        <div>{inscripcion.correo}</div>
                        {inscripcion.telefono && (
                          <div className={estilos.telefonoTexto}>{inscripcion.telefono}</div>
                        )}
                      </td>
                      {eventoSeleccionado?.tipo === "nasa" && (
                        <td className={estilos.celdaLogistica}>
                          <div className={estilos.logisticaTags}>
                            {inscripcion.eps && (
                              <span className={estilos.badgeEps} title="EPS Afiliado">
                                🏥 {inscripcion.eps}
                              </span>
                            )}
                            <span
                              className={
                                inscripcion.esVegetariano
                                  ? estilos.badgeVegetariano
                                  : estilos.badgeEstandar
                              }
                              title="Menú / Alimentación"
                            >
                              {inscripcion.esVegetariano ? "🥗 Vegetariano" : "🥩 Normal"}
                            </span>
                            {inscripcion.alergiasAlimentos &&
                              inscripcion.alergiasAlimentos.toLowerCase() !== "ninguna" && (
                                <span className={estilos.badgeAlergia} title="Alergias">
                                  ⚠️ {inscripcion.alergiasAlimentos}
                                </span>
                              )}
                            {inscripcion.tipoVehiculo && inscripcion.tipoVehiculo !== "Ninguno" ? (
                              <span className={estilos.badgeVehiculo} title="Parqueadero reservado">
                                {inscripcion.tipoVehiculo === "Carro" ? "🚗" : "🏍️"}{" "}
                                {inscripcion.tipoVehiculo} · {inscripcion.placaVehiculo || "Sin placa"}
                              </span>
                            ) : (
                              <span className={estilos.badgeSinVehiculo} title="Sin vehículo">
                                🚶 Sin vehículo
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      <td>
                        {inscripcion.codigo ? (
                          <code className={estilos.codigo}>{inscripcion.codigo}</code>
                        ) : (
                          <span className={estilos.badgeSinCodigo}>Evento masivo</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`${estilos.badgeAsistencia} ${
                            asistio ? estilos.badgeAsistio : estilos.badgePendiente
                          }`}
                        >
                          {asistio ? "Asistió" : "Pendiente"}
                        </span>
                      </td>
                      <td className={estilos.celdaAccion}>
                        {!asistio && (
                          <button
                            type="button"
                            className={estilos.botonMarcar}
                            disabled={estaMarcando}
                            onClick={() => manejarMarcar(identificador)}
                          >
                            <Check className={estilos.iconoBoton} aria-hidden="true" />
                            {estaMarcando ? "Marcando..." : "Marcar asistencia"}
                          </button>
                        )}
                        {asistio && (
                          <span className={estilos.textoAsistencia}>
                            <UserCheck className={estilos.iconoOk} aria-hidden="true" />
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {inscripciones.length > 0 && (
          <p className={estilos.pie}>
            <UserCheck className={estilos.iconoPie} aria-hidden="true" />
            {totalAsistentes} de {totalInscritos} inscritos han asistido.
          </p>
        )}
      </div>

      <Notificacion mensaje={notificacion} onCerrar={() => setNotificacion("")} />

      {evento?.esMasivo && (
        <ModalQrAsistencia
          abierto={modalQrAbierto}
          onCerrar={() => setModalQrAbierto(false)}
          evento={evento}
        />
      )}
    </div>
  );
}