import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  Navigation,
  Users,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  CloudRain,
  UserX,
  QrCode,
  Utensils,
  HeartPulse,
  Car,
} from "lucide-react";
import ModalEventoCancelado from "../../../components/common/ModalEventoCancelado/ModalEventoCancelado.jsx";
import { useEventosContext } from "../../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../../utils/formato.js";
import {
  TIPOS_DOCUMENTO,
  RELACIONES_ITM,
  PROGRAMAS_ITM,
} from "../../../data/programasItm.js";
import { IMAGENES } from "../../../data/imagenes.js";
import estilos from "./DetalleEvento.module.css";

function construirUrlMapa(direccion) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    direccion
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}

export default function DetalleEvento() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { obtenerEvento, inscribir, programasAcademicos } = useEventosContext();
  const evento = obtenerEvento(id);

  const esModoAsistencia =
    searchParams.get("modo") === "asistencia" || searchParams.get("qr") === "1";
  const esNasa = evento?.tipo === "nasa";
  const esMasivo = Boolean(evento?.esMasivo);
  const capacidad = Number(evento?.capacidad) > 0 ? Number(evento.capacidad) : 50;
  const inscritos = Number(evento?.inscritos) || 0;
  const cuposDisponibles = esMasivo ? Infinity : Math.max(0, capacidad - inscritos);
  const porcentajeOcupado = esMasivo ? 0 : Math.min(100, Math.round((inscritos / capacidad) * 100));
  const esCancelado = evento?.estado === "cancelado";
  const estaAgotado = !esMasivo && !esCancelado && cuposDisponibles === 0;
  const ultimosCupos = !esMasivo && !esCancelado && cuposDisponibles > 0 && cuposDisponibles <= 5;

  const direccionEvento =
    (evento?.ubicacionMapa || "").trim() ||
    (evento?.lugar || "").trim() ||
    "Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia";

  const enlaceRuta = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    direccionEvento
  )}`;

  const [confirmada, setConfirmada] = useState(false);
  const [modalCanceladoAbierto, setModalCanceladoAbierto] = useState(false);
  const [datos, setDatos] = useState({
    nombre: "",
    tipoDocumento: "CC",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    relacionUniversidad: "Estudiante",
    programaAcademico: "",
    esVegetariano: false,
    alergiasAlimentos: "",
    eps: "",
    tipoVehiculo: "Ninguno",
    placaVehiculo: "",
  });
  const [inscripcion, setInscripcion] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const inscripcionRef = useRef(null);

  useEffect(() => {
    inscripcionRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (!evento || (evento.estado !== "publicado" && evento.estado !== "cancelado")) {
    return <Navigate to="/eventos" replace />;
  }

  const manejarCambio = (campo) => (eventoInput) => {
    let valor =
      eventoInput.target.type === "checkbox"
        ? eventoInput.target.checked
        : eventoInput.target.value;

    if (campo === "telefono") {
      valor = valor.replace(/[^\d\s\-+()]/g, "");
    }
    if (campo === "numeroDocumento") {
      valor = valor.replace(/[^\w\-]/g, "");
    }
    if (campo === "placaVehiculo") {
      valor = valor.toUpperCase().replace(/[^A-Z0-9]/g, "");
    }
    setDatos((prev) => {
      const nuevos = { ...prev, [campo]: valor };
      if (campo === "relacionUniversidad" && valor !== "Estudiante") {
        nuevos.programaAcademico = "";
      }
      if (campo === "tipoVehiculo" && valor === "Ninguno") {
        nuevos.placaVehiculo = "";
      }
      return nuevos;
    });
    if (error) setError("");
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    const nombre = datos.nombre.trim();
    const tipoDocumento = datos.tipoDocumento;
    const numeroDocumento = datos.numeroDocumento.trim();
    const correo = datos.correo.trim();
    const telefono = datos.telefono.trim();
    const relacionUniversidad = datos.relacionUniversidad;
    const programaAcademico = (datos.programaAcademico || "").trim();

    if (!nombre) {
      setError("Escribe tus nombres y apellidos.");
      return;
    }

    const palabrasNombre = nombre.split(/\s+/).filter(Boolean);
    const palabraValida = (palabra) =>
      /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ']{2,}$/.test(palabra) &&
      /[aeiouáéíóúü]/i.test(palabra);

    if (palabrasNombre.length < 2) {
      setError("Ingresa al menos un nombre y un apellido.");
      return;
    }
    if (!palabrasNombre.every(palabraValida)) {
      setError("El nombre no parece real. Escribe tus nombres y apellidos.");
      return;
    }

    if (!numeroDocumento || numeroDocumento.length < 5) {
      setError("Ingresa tu número de documento válido (mínimo 5 caracteres).");
      return;
    }

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!telefono) {
      setError("Ingresa tu número de celular.");
      return;
    }

    let soloDigitos = telefono.replace(/\D/g, "");

    // Si comienza con código de país 57 (Colombia) y tiene 12 dígitos, extraer los 10 dígitos locales
    if (soloDigitos.startsWith("57") && soloDigitos.length === 12) {
      soloDigitos = soloDigitos.slice(2);
    }

    // Celular en Colombia (10 dígitos comenzando en 3) o formato internacional (+ seguido de 10 a 15 dígitos)
    const esCelularColombia = /^3\d{9}$/.test(soloDigitos);
    const esInternacional =
      telefono.startsWith("+") &&
      soloDigitos.length >= 10 &&
      soloDigitos.length <= 15;

    if (!esCelularColombia && !esInternacional) {
      setError(
        "Ingresa un número de celular válido de 10 dígitos (ej: 300 123 4567)."
      );
      return;
    }

    if (/^(\d)\1{9,}$/.test(soloDigitos)) {
      setError("El número de celular ingresado no parece ser real.");
      return;
    }

    if (relacionUniversidad === "Estudiante" && !programaAcademico) {
      setError("Por favor selecciona tu programa académico del ITM.");
      return;
    }

    if (evento.tipo === "nasa") {
      if (!datos.eps.trim()) {
        setError("Por favor indica la EPS o entidad de salud a la que estás afiliado.");
        return;
      }
      if (datos.tipoVehiculo !== "Ninguno" && !datos.placaVehiculo.trim()) {
        setError("Por favor ingresa la placa de tu vehículo (carro o moto) para coordinar el parqueadero.");
        return;
      }
    }

    const palabras = nombre.split(/\s+/).filter(Boolean);
    const nombres = palabras.length > 1 ? palabras.slice(0, -1).join(" ") : palabras[0];
    const apellidos = palabras.length > 1 ? palabras[palabras.length - 1] : palabras[0];

    const progObj = (programasAcademicos || []).find(
      (p) => p.nombre?.toLowerCase() === programaAcademico.toLowerCase()
    );
    const programaId = progObj ? progObj.id : null;

    setCargando(true);
    setError("");
    try {
      const resultado = await inscribir({
        eventoId: evento.id,
        nombre,
        nombres,
        apellidos,
        tipoDocumento,
        numeroDocumento,
        correo,
        telefono,
        relacionUniversidad,
        programaAcademico,
        programaId,
        esVegetariano: Boolean(datos.esVegetariano),
        alergiasAlimentos: datos.alergiasAlimentos.trim() || "Ninguna",
        eps: datos.eps.trim(),
        tipoVehiculo: datos.tipoVehiculo,
        placaVehiculo: datos.placaVehiculo.trim(),
      });
      if (!resultado.exito) {
        setError(resultado.error);
        return;
      }
      setInscripcion(resultado.inscripcion);
      setConfirmada(true);
    } catch (err) {
      setError(err?.mensaje || err?.message || "Ocurrió un error al registrar la inscripción.");
    } finally {
      setCargando(false);
    }
  };

  const copiarCodigo = () => {
    if (!inscripcion?.codigo) return;
    navigator.clipboard.writeText(inscripcion.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  return (
    <section className={estilos.raiz}>
      <Link to="/eventos" className={estilos.volver}>
        <ChevronLeft className={estilos.iconoVolver} aria-hidden="true" />
        Volver a eventos
      </Link>

      <div className={estilos.gridDetalle}>
        <div className={estilos.heroCard}>
          {evento.imagen && (
            <div className={estilos.imagenWrap}>
              <img
                src={evento.imagen || IMAGENES.GENERAL.DEFAULT_EVENTO}
                alt={evento.titulo}
                className={estilos.imagen}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = IMAGENES.GENERAL.DEFAULT_EVENTO;
                }}
              />
            </div>
          )}
          <div className={estilos.info}>
            <div className={estilos.badgesHeaderWrap}>
              <span
                className={`${estilos.badgeTipo} ${
                  estilos[`badgeTipo_${evento.tipo}`] || estilos.badgeTipo_abierto
                }`}
              >
                {evento.tipo === "charla"
                  ? "Charla"
                  : evento.tipo === "observacion"
                    ? "Observación"
                    : evento.tipo === "nasa"
                      ? "🚀 Evento Especial NASA"
                      : "Abierto al público"}
              </span>
              {esCancelado && (
                <span className={estilos.badgeCanceladoHero}>
                  Cancelado por el docente
                </span>
              )}
            </div>
            <h1 className={estilos.titulo}>{evento.titulo}</h1>
            <p className={estilos.descripcion}>{evento.descripcion}</p>

            <ul className={estilos.meta}>
              <li className={estilos.metaItem}>
                <CalendarDays className={estilos.metaIcon} aria-hidden="true" />
                <span>{formatearFecha(evento.fecha)}</span>
              </li>
              <li className={estilos.metaItem}>
                <Clock className={estilos.metaIcon} aria-hidden="true" />
                <span>{formatearHora(evento.hora)}</span>
              </li>
              <li className={estilos.metaItem}>
                <MapPin className={estilos.metaIcon} aria-hidden="true" />
                <span>{evento.lugar}</span>
              </li>
              {estaAgotado && (
                <li className={`${estilos.metaItem} ${estilos.metaItemAgotado}`}>
                  <Users className={estilos.metaIcon} aria-hidden="true" />
                  <span>No hay cupos disponibles</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className={estilos.inscripcion} ref={inscripcionRef}>
        {confirmada && inscripcion ? (
          <div className={estilos.confirmacion} role="status">
            <CheckCircle2 className={estilos.iconoExito} aria-hidden="true" />
            <h2 className={estilos.confirmacionTitulo}>
              {esMasivo
                ? `¡Registro exitoso, ${datos.nombre || "participante"}!`
                : `¡Inscripción confirmada, ${datos.nombre || "participante"}!`}
            </h2>
            <p className={estilos.confirmacionTexto}>
              Te esperamos en <strong>{evento.lugar}</strong> el{" "}
              <strong>{formatearFecha(evento.fecha)}</strong> a las{" "}
              <strong>{formatearHora(evento.hora)}</strong>.
            </p>

            <div className={estilos.resumenInscrito}>
              <div className={estilos.resumenInscritoFila}>
                <span className={estilos.resumenInscritoEtiqueta}>Participante:</span>
                <span className={estilos.resumenInscritoValor}>{inscripcion.nombre}</span>
              </div>
              <div className={estilos.resumenInscritoFila}>
                <span className={estilos.resumenInscritoEtiqueta}>Documento:</span>
                <span className={estilos.resumenInscritoValor}>
                  {inscripcion.tipoDocumento} {inscripcion.numeroDocumento}
                </span>
              </div>
              <div className={estilos.resumenInscritoFila}>
                <span className={estilos.resumenInscritoEtiqueta}>Relación ITM:</span>
                <span className={estilos.resumenInscritoValor}>
                  {inscripcion.relacionUniversidad}
                  {inscripcion.programaAcademico ? ` · ${inscripcion.programaAcademico}` : ""}
                </span>
              </div>
              {evento.tipo === "nasa" && (
                <>
                  <div className={estilos.resumenInscritoFila}>
                    <span className={estilos.resumenInscritoEtiqueta}>EPS / Salud:</span>
                    <span className={estilos.resumenInscritoValor}>{datos.eps}</span>
                  </div>
                  <div className={estilos.resumenInscritoFila}>
                    <span className={estilos.resumenInscritoEtiqueta}>Alimentación:</span>
                    <span className={estilos.resumenInscritoValor}>
                      {datos.esVegetariano ? "Opción Vegetariana" : "Menú Estándar"}
                      {datos.alergiasAlimentos ? ` (Alergias: ${datos.alergiasAlimentos})` : ""}
                    </span>
                  </div>
                  <div className={estilos.resumenInscritoFila}>
                    <span className={estilos.resumenInscritoEtiqueta}>Parqueadero:</span>
                    <span className={estilos.resumenInscritoValor}>
                      {datos.tipoVehiculo !== "Ninguno"
                        ? `${datos.tipoVehiculo} · Placa ${datos.placaVehiculo} (Cupo reservado)`
                        : "No requiere parqueadero"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {esMasivo && !esNasa ? (
              <div className={estilos.cajaMasivoConfirmacion}>
                <div className={estilos.badgeMasivoExito}>
                  <Sparkles className={estilos.iconoSparkle} aria-hidden="true" />
                  <span>Evento Masivo · Entrada Libre</span>
                  <span>¡Asistencia Confirmada en Sitio!</span>
                </div>
                <p className={estilos.textoMasivoExito}>
                  Hemos registrado tus datos para llevar el control y aforo de participantes del evento.
                  Tu asistencia a <strong>{evento.titulo}</strong> ha sido registrada y validada oficialmente en el sistema del Observatorio ITM.
                </p>
                <div className={estilos.avisoSinCorreo}>
                  <p>
                    Al ser un evento abierto y masivo con entrada libre, <strong>no requieres código de acceso</strong> ni se enviará confirmación a tu correo. ¡Solo acércate y disfruta del evento!
                    Al ser un evento con registro presencial en sitio, <strong>tu asistencia ya quedó confirmada</strong> sin necesidad de trámites adicionales. ¡Bienvenido y que disfrutes la actividad!
                  </p>
                </div>
              </div>
            ) : (
              <div className={estilos.codigoCaja}>
                <span className={estilos.codigoEtiqueta}>Tu código de 4 dígitos</span>
                <div className={estilos.digitosFila}>
                  {String(inscripcion.codigo || "0000")
                    .split("")
                    .map((digito, i) => (
                      <span key={i} className={estilos.bloqueDigito}>
                        {digito}
                      </span>
                    ))}
                </div>
                <button
                  type="button"
                  className={estilos.botonCopiar}
                  onClick={copiarCodigo}
                  aria-label="Copiar código de 4 dígitos"
                >
                  {copiado ? (
                    <>
                      <Check className={estilos.iconoBoton} aria-hidden="true" />
                      Código copiado
                    </>
                  ) : (
                    <>
                      <Copy className={estilos.iconoBoton} aria-hidden="true" />
                      Copiar código ({inscripcion.codigo})
                    </>
                  )}
                </button>
                <p className={estilos.codigoCorreoAviso}>
                  ✉️ Hemos enviado este código a tu correo:{" "}
                  <strong>{inscripcion.correo}</strong>
                </p>
                <p className={estilos.codigoAyuda}>
                  Presenta este código al ingresar al evento para registrar tu asistencia.
                </p>
              </div>
            )}

            <Link to="/eventos" className={estilos.enlaceVolver}>
              Ver más eventos
            </Link>
          </div>
        ) : (
          <>
            {!esCancelado && !estaAgotado && (
              <>
                <h2 className={estilos.inscripcionTitulo}>Inscríbete a este evento</h2>
                <p className={estilos.inscripcionTexto}>
                  {esMasivo
                    ? "Completa tus datos para registrar tu asistencia. La entrada es gratuita y de aforo libre."
                    : "Completa tus datos para reservar tu cupo. La entrada es gratuita."}
                </p>
              </>
            )}

            {esCancelado ? (
              <div className={estilos.cajaCancelado}>
                <div className={estilos.iconoCanceladoWrap}>
                  {evento?.motivoCancelacion === "personal" ? (
                    <UserX className={estilos.iconoCancelado} aria-hidden="true" />
                  ) : (
                    <CloudRain className={estilos.iconoCancelado} aria-hidden="true" />
                  )}
                </div>
                <span className={estilos.badgeCanceladoCard}>Cancelado por el docente</span>
                <h3 className={estilos.tituloCancelado}>Inscripciones no disponibles</h3>
                <p className={estilos.textoCancelado}>
                  {evento?.motivoCancelacion === "personal"
                    ? "Este evento ha sido cancelado por el docente por motivos personales o fuerza mayor."
                    : "Este evento ha sido cancelado por el docente debido a condiciones climáticas desfavorables."}
                </p>
                <button
                  type="button"
                  className={estilos.botonIntentarInscripcion}
                  onClick={() => setModalCanceladoAbierto(true)}
                >
                  Inscribirme
                </button>
                <Link to="/eventos" className={estilos.botonExplorarOtros}>
                  Ver otros eventos disponibles
                </Link>
              </div>
            ) : esMasivo && !esNasa && !esModoAsistencia ? (
              <div className={estilos.cajaAvisoMasivo}>
                <div className={estilos.iconoMasivoWrap}>
                  <QrCode className={estilos.iconoMasivo} aria-hidden="true" />
                </div>
                <span className={estilos.badgeAforoLibre}>Entrada Libre · Sin inscripción previa</span>
                <h3 className={estilos.tituloMasivoAviso}>Asistencia por Código QR</h3>
                <p className={estilos.textoMasivoAviso}>
                  Este es un evento masivo de entrada libre y aforo abierto en el Observatorio ITM.
                  <strong> No requiere inscripción previa por la página web.</strong>
                </p>
                <div className={estilos.cajaPasosAsistencia}>
                  <p className={estilos.pasoTitulo}>¿Cómo registrarás tu asistencia el día del evento?</p>
                  <ol className={estilos.listaPasos}>
                    <li>Asiste a <strong>{evento.lugar}</strong> el <strong>{formatearFecha(evento.fecha)}</strong> a las <strong>{formatearHora(evento.hora)}</strong>.</li>
                    <li>En el auditorio o entrada, el docente proyectará un <strong>código QR</strong> en pantalla.</li>
                    <li>Escanea el código QR con tu celular y completa el breve formulario móvil para que tu asistencia quede confirmada al instante.</li>
                  </ol>
                </div>
              </div>
            ) : estaAgotado ? (
              <div className={estilos.cajaAgotado}>
                <AlertCircle className={estilos.iconoAgotado} aria-hidden="true" />
                <h3 className={estilos.tituloAgotado}>No hay cupos disponibles</h3>
                <p className={estilos.textoAgotado}>
                  Este evento ha alcanzado el aforo máximo y no cuenta con cupos disponibles para inscripción. Te invitamos a explorar nuestras próximas actividades.
                </p>
                <Link to="/eventos" className={estilos.botonExplorarOtros}>
                  Ver otros eventos disponibles
                </Link>
              </div>
            ) : (
              <>
                {esMasivo && esModoAsistencia && (
                  <div className={estilos.bannerModoAsistencia}>
                    <QrCode size={18} aria-hidden="true" />
                    <span>Escaneo presencial · Toma de asistencia en sitio</span>
                  </div>
                )}
                <h2 className={estilos.inscripcionTitulo}>
                  {esModoAsistencia
                    ? "Registro de Asistencia en Sitio"
                    : "Inscríbete a este evento"}
                </h2>
                <p className={estilos.inscripcionTexto}>
                  {esModoAsistencia
                    ? "Diligencia tus datos a continuación para registrar y confirmar tu asistencia en este evento masivo."
                    : esNasa
                      ? "Completa tus datos para recibir tu código de acceso de 4 dígitos y asegurar tu cupo de logística y parqueadero."
                      : "Completa tus datos para reservar tu cupo. La entrada es gratuita."}
                </p>

                <form className={estilos.formulario} onSubmit={manejarEnvio} noValidate>
                  {error && (
                    <p className={estilos.errorForm} role="alert">
                      {error}
                    </p>
                  )}

                <div className={estilos.campo}>
                  <label className={estilos.etiqueta} htmlFor="nombre">
                    Nombres y apellidos *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={datos.nombre}
                    onChange={manejarCambio("nombre")}
                    className={estilos.input}
                    placeholder="Ej: Juan Camilo Pérez Restrepo"
                  />
                </div>

                <div className={estilos.filaFormulario}>
                  <div className={estilos.campo}>
                    <label className={estilos.etiqueta} htmlFor="tipoDocumento">
                      Tipo de documento *
                    </label>
                    <select
                      id="tipoDocumento"
                      value={datos.tipoDocumento}
                      onChange={manejarCambio("tipoDocumento")}
                      className={estilos.select}
                    >
                      {TIPOS_DOCUMENTO.map((td) => (
                        <option key={td.valor} value={td.valor}>
                          {td.etiqueta}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={estilos.campo}>
                    <label className={estilos.etiqueta} htmlFor="numeroDocumento">
                      Número de documento *
                    </label>
                    <input
                      id="numeroDocumento"
                      type="text"
                      required
                      value={datos.numeroDocumento}
                      onChange={manejarCambio("numeroDocumento")}
                      className={estilos.input}
                      placeholder="Ej: 1020304050"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div className={estilos.filaFormulario}>
                  <div className={estilos.campo}>
                    <label className={estilos.etiqueta} htmlFor="correo">
                      Correo electrónico *
                    </label>
                    <input
                      id="correo"
                      type="email"
                      required
                      value={datos.correo}
                      onChange={manejarCambio("correo")}
                      className={estilos.input}
                      placeholder="tucorreo@ejemplo.com"
                    />
                  </div>

                  <div className={estilos.campo}>
                    <label className={estilos.etiqueta} htmlFor="telefono">
                      Teléfono / Celular *
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      required
                      value={datos.telefono}
                      onChange={manejarCambio("telefono")}
                      className={estilos.input}
                      placeholder="Ej: 300 123 4567"
                      maxLength={16}
                    />
                  </div>
                </div>

                <div className={estilos.campo}>
                  <label className={estilos.etiqueta} htmlFor="relacionUniversidad">
                    Relación con la universidad *
                  </label>
                  <select
                    id="relacionUniversidad"
                    value={datos.relacionUniversidad}
                    onChange={manejarCambio("relacionUniversidad")}
                    className={estilos.select}
                  >
                    {RELACIONES_ITM.map((rel) => (
                      <option key={rel.valor} value={rel.valor}>
                        {rel.etiqueta}
                      </option>
                    ))}
                  </select>
                </div>

                {datos.relacionUniversidad === "Estudiante" && (
                  <div className={estilos.campo}>
                    <label className={estilos.etiqueta} htmlFor="programaAcademico">
                      Programa académico en el ITM *
                    </label>
                    <select
                      id="programaAcademico"
                      value={datos.programaAcademico}
                      onChange={manejarCambio("programaAcademico")}
                      className={estilos.select}
                      required
                    >
                      <option value="">-- Selecciona tu programa académico --</option>
                      {(programasAcademicos && programasAcademicos.length > 0
                        ? programasAcademicos.map((p) => p.nombre)
                        : PROGRAMAS_ITM
                      ).map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                    <span className={estilos.ayudaCampo}>
                      Selecciona la carrera o tecnología que estás cursando actualmente.
                    </span>
                  </div>
                )}

                {evento.tipo === "nasa" && (
                  <div className={estilos.seccionLogisticaNasa}>
                    <div className={estilos.encabezadoLogisticaNasa}>
                      <span className={estilos.badgeLogistica}>🚀 Logística Evento NASA</span>
                      <h3 className={estilos.tituloLogistica}>Información para tu estadía y bienestar</h3>
                      <p className={estilos.descLogistica}>
                        Para coordinar tu refrigerio, atención de salud y acceso vehicular al campus del ITM, por favor completa estos datos:
                      </p>
                    </div>

                    {/* Alimentación */}
                    <div className={estilos.grupoLogistico}>
                      <div className={estilos.subtituloGrupo}>
                        <Utensils size={16} aria-hidden="true" />
                        <span>Alimentación y Refrigerio</span>
                      </div>

                      <div className={estilos.campoCheckbox}>
                        <label className={estilos.labelCheckbox}>
                          <input
                            type="checkbox"
                            checked={datos.esVegetariano}
                            onChange={manejarCambio("esVegetariano")}
                            className={estilos.checkbox}
                          />
                          <span>Deseo opción de refrigerio o menú vegetariano</span>
                        </label>
                      </div>

                      <div className={estilos.campo}>
                        <label className={estilos.etiqueta} htmlFor="alergiasAlimentos">
                          Alergias o restricciones alimentarias
                        </label>
                        <input
                          id="alergiasAlimentos"
                          type="text"
                          value={datos.alergiasAlimentos}
                          onChange={manejarCambio("alergiasAlimentos")}
                          className={estilos.input}
                          placeholder="Ej: Ninguna, alérgico al maní, intolerancia al gluten o lactosa..."
                        />
                      </div>
                    </div>

                    {/* Salud / EPS */}
                    <div className={estilos.grupoLogistico}>
                      <div className={estilos.subtituloGrupo}>
                        <HeartPulse size={16} aria-hidden="true" />
                        <span>Salud y Seguridad Social</span>
                      </div>

                      <div className={estilos.campo}>
                        <label className={estilos.etiqueta} htmlFor="eps">
                          EPS a la que estás afiliado *
                        </label>
                        <input
                          id="eps"
                          type="text"
                          required
                          value={datos.eps}
                          onChange={manejarCambio("eps")}
                          className={estilos.input}
                          placeholder="Ej: SURA, Sisbén, Sanitas, Nueva EPS, Savia Salud..."
                          list="lista-eps-sugeridas"
                        />
                        <datalist id="lista-eps-sugeridas">
                          <option value="SURA" />
                          <option value="Sisbén" />
                          <option value="Sanitas" />
                          <option value="Nueva EPS" />
                          <option value="Salud Total" />
                          <option value="Savia Salud" />
                          <option value="Compensar" />
                          <option value="Famisanar" />
                          <option value="Coosalud" />
                          <option value="Particular / Ninguna" />
                        </datalist>
                        <span className={estilos.ayudaCampo}>
                          Requerido para el protocolo de seguridad y atención de emergencias en el campus.
                        </span>
                      </div>
                    </div>

                    {/* Movilidad / Parqueadero */}
                    <div className={estilos.grupoLogistico}>
                      <div className={estilos.subtituloGrupo}>
                        <Car size={16} aria-hidden="true" />
                        <span>Movilidad y Reserva de Parqueadero</span>
                      </div>

                      <div className={estilos.campo}>
                        <label className={estilos.etiqueta} htmlFor="tipoVehiculo">
                          ¿Asistirás en vehículo al campus? *
                        </label>
                        <select
                          id="tipoVehiculo"
                          value={datos.tipoVehiculo}
                          onChange={manejarCambio("tipoVehiculo")}
                          className={estilos.select}
                        >
                          <option value="Ninguno">No requiero parqueadero (Transporte público / A pie / Bicicleta)</option>
                          <option value="Carro">Sí, asistiré en Carro (Separar celda de parqueadero)</option>
                          <option value="Moto">Sí, asistiré en Moto (Separar celda de parqueadero)</option>
                        </select>
                      </div>

                      {datos.tipoVehiculo !== "Ninguno" && (
                        <div className={estilos.campo}>
                          <label className={estilos.etiqueta} htmlFor="placaVehiculo">
                            Placa del vehículo *
                          </label>
                          <input
                            id="placaVehiculo"
                            type="text"
                            required
                            maxLength={10}
                            value={datos.placaVehiculo}
                            onChange={manejarCambio("placaVehiculo")}
                            className={estilos.input}
                            placeholder="Ej: AAA123 (Carro) o ABC12D (Moto)"
                          />
                          <span className={estilos.ayudaCampo}>
                            El personal de vigilancia del ITM autorizará el ingreso de esta placa a los parqueaderos del campus.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button type="submit" className={estilos.botonInscribirse} disabled={cargando}>
                  {cargando
                    ? (esModoAsistencia ? "Registrando asistencia..." : "Completando inscripción...")
                    : (esModoAsistencia ? "Confirmar mi asistencia" : "Inscribirme")}
                </button>
              </form>
            </>
          )}
          </>
        )}
        </div>

        <div className={estilos.ubicacion}>
          <div className={estilos.ubicacionHeader}>
            <h2 className={estilos.ubicacionTitulo}>¿Cómo llegar?</h2>
            <p className={estilos.ubicacionTexto}>
              El evento se realiza en <strong>{direccionEvento}</strong>. Usa el mapa para ubicarte o calcular tu ruta.
            </p>
            <a
              href={enlaceRuta}
              target="_blank"
              rel="noopener noreferrer"
              className={estilos.botonRuta}
            >
              <Navigation className={estilos.iconoBoton} aria-hidden="true" />
              Ver ruta en Google Maps
            </a>
          </div>

          <div className={estilos.mapaWrap}>
            <div className={estilos.mapaPin}>
              <MapPin className={estilos.mapaPinIcono} aria-hidden="true" />
              {direccionEvento}
            </div>
            <iframe
              src={construirUrlMapa(direccionEvento)}
              title={`Mapa de ubicación del evento ${evento.titulo}`}
              className={estilos.mapa}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <ModalEventoCancelado
        abierto={modalCanceladoAbierto}
        onCerrar={() => setModalCanceladoAbierto(false)}
        tituloEvento={evento?.titulo}
        motivo={evento?.motivoCancelacion || "clima"}
      />
    </section>
  );
}