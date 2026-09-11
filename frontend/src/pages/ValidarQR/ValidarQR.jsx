import { useState } from "react";
import {
  ScanLine,
  Camera,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  CalendarDays,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Header from "../../components/layout/Header/Header.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import EscanerVideo from "../../components/pages/ValidarQR/EscanerVideo/EscanerVideo.jsx";
import { useEventosContext } from "../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../utils/formato.js";
import estilos from "./ValidarQR.module.css";

export default function ValidarQR() {
  const { obtenerEvento, obtenerInscripcion, marcarAsistencia } = useEventosContext();
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [tipoResultado, setTipoResultado] = useState("");
  const [ingresos, setIngresos] = useState([]);
  const [notificacion, setNotificacion] = useState("");
  const [escanerAbierto, setEscanerAbierto] = useState(false);

  const validarCodigo = (texto) => {
    const verificar = obtenerInscripcion(texto);
    if (!verificar.exito) {
      setResultado({
        inscripcion: verificar.inscripcion || null,
        error: verificar.error,
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

  const manejarDetectado = (texto) => {
    setEscanerAbierto(false);
    validarCodigo(texto);
  };

  const manejarConfirmar = () => {
    if (!resultado) return;
    const marcado = marcarAsistencia(resultado.inscripcion.codigo);
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
          rutaBreadcrumb={["Dashboard", "Validar código QR"]}
          titulo="Validar código QR de asistencia"
        />
      </div>

      <div className={estilos.contenedor}>
        <div className={estilos.tarjetaEscaner}>
          <span className={estilos.iconoEscanerWrap}>
            <ScanLine className={estilos.iconoEscaner} aria-hidden="true" />
          </span>
          <form className={estilos.formulario} onSubmit={manejarValidar}>
            <label className={estilos.etiqueta} htmlFor="codigo-qr">
              Código QR del participante
            </label>
            <div className={estilos.filaInput}>
              <input
                id="codigo-qr"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className={estilos.input}
                placeholder="ITM-XXXX-XXXXXX"
                autoComplete="off"
              />
              <button type="submit" className={estilos.botonBuscar}>
                <Search className={estilos.iconoBoton} aria-hidden="true" />
                Validar
              </button>
            </div>
            <div className={estilos.barra_opciones}>
              <button
                type="button"
                className={estilos.botonEscanear}
                onClick={() => setEscanerAbierto((abierto) => !abierto)}
              >
                <Camera className={estilos.iconoBoton} aria-hidden="true" />
                {escanerAbierto ? "Cerrar cámara" : "Escanear con cámara"}
              </button>
              <p className={estilos.ayuda}>
                Escanea el QR del participante con la cámara o ingresa el código
                manualmente para registrar su asistencia.
              </p>
            </div>
          </form>
        </div>

        {escanerAbierto && (
          <div className={estilos.tarjetaCamara}>
            <h2 className={estilos.tituloCamara}>
              Escanea el código QR del participante
            </h2>
            <EscanerVideo onDetect={manejarDetectado} onCerrar={() => setEscanerAbierto(false)} />
          </div>
        )}

        {tipoResultado === "encontrado" && inscripcionVisible && eventoVisible && (
          <div className={estilos.tarjetaResultado} role="status">
            <div className={estilos.qrWrap}>
              <QRCodeSVG value={inscripcionVisible.codigo} size={140} />
              <p className={estilos.codigoQr}>{inscripcionVisible.codigo}</p>
            </div>

            <div className={estilos.datosResultado}>
              <span className={estilos.badgeEncontrado}>
                <CheckCircle2 className={estilos.iconoBadge} aria-hidden="true" />
                Participante encontrado
              </span>
              <h2 className={estilos.nombre}>{inscripcionVisible.nombre}</h2>

              <ul className={estilos.meta}>
                <li>
                  <User className={estilos.iconoMeta} aria-hidden="true" />
                  {inscripcionVisible.correo}
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

        {tipoResultado === "confirmado" && inscripcionVisible && (
          <div className={estilos.exito} role="status">
            <CheckCircle2 className={estilos.iconoExito} aria-hidden="true" />
            <h2 className={estilos.tituloExito}>
              ¡Asistencia registrada con éxito!
            </h2>
            <p className={estilos.textoExito}>
              La asistencia de <strong>{inscripcionVisible.nombre}</strong> fue confirmada
              correctamente para el evento.
            </p>
          </div>
        )}

        {tipoResultado === "error" && (
          <div className={estilos.error} role="alert">
            {resultado?.inscripcion ? (
              <AlertTriangle className={estilos.iconoError} aria-hidden="true" />
            ) : (
              <XCircle className={estilos.iconoError} aria-hidden="true" />
            )}
            <div>
              <h2 className={estilos.tituloError}>
                {resultado?.inscripcion
                  ? "Este código ya fue validado"
                  : "Código no válido"}
              </h2>
              <p className={estilos.textoError}>{resultado?.error}</p>
            </div>
          </div>
        )}

        {ingresos.length > 0 && (
          <div className={estilos.seccionIngresos}>
            <h2 className={estilos.tituloIngresos}>Asistencias registradas en esta sesión</h2>
            <ul className={estilos.listaIngresos}>
              {ingresos.map((inscripcion) => (
                <li key={inscripcion.codigo} className={estilos.filaIngreso}>
                  <BadgeCheck className={estilos.iconoIngreso} aria-hidden="true" />
                  <span className={estilos.nombreIngreso}>{inscripcion.nombre}</span>
                  <code className={estilos.codigoIngreso}>{inscripcion.codigo}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Notificacion mensaje={notificacion} onCerrar={() => setNotificacion("")} />
    </div>
  );
}