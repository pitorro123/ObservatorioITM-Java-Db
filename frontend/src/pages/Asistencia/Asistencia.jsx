import { useState } from "react";
import {
  CalendarDays,
  Users,
  UserCheck,
  MapPin,
  Check,
  Clock,
} from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import BuscadorSelect from "../../components/common/BuscadorSelect/BuscadorSelect.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import { useEventosContext } from "../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../utils/formato.js";
import estilos from "./Asistencia.module.css";

export default function Asistencia() {
  const {
    eventos,
    inscripcionesPorEvento,
    marcarAsistencia,
    obtenerInscripcion,
  } = useEventosContext();

  const eventosConInscritos = eventos.filter(
    (evento) => inscripcionesPorEvento(evento.id).length > 0
  );

  const [eventoId, setEventoId] = useState(
    eventosConInscritos[0]?.id ?? eventos[0]?.id ?? ""
  );
  const [notificacion, setNotificacion] = useState("");
  const [marcandoId, setMarcandoId] = useState(null);

  const evento = eventos.find((e) => e.id === Number(eventoId));
  const inscripciones = eventoId ? inscripcionesPorEvento(eventoId) : [];
  const totalInscritos = inscripciones.length;
  const totalAsistentes = inscripciones.filter(
    (i) => i.asistencia === "Asistió"
  ).length;

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
              <p className={estilos.nombreEvento}>{evento.titulo}</p>
              <p className={estilos.metaEvento}>
                {formatearFecha(evento.fecha)} · {formatearHora(evento.hora)} ·{" "}
                <MapPin className={estilos.iconoInline} aria-hidden="true" />
                {evento.lugar}
              </p>
            </div>
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
          </div>
        )}

        {inscripciones.length === 0 ? (
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
                          {new Date(inscripcion.fechaInscripcion).toLocaleDateString(
                            "es-CO"
                          )}
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
    </div>
  );
}