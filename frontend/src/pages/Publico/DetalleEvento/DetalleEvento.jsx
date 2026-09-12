import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
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
} from "lucide-react";
import ModalEventoCancelado from "../../../components/common/ModalEventoCancelado/ModalEventoCancelado.jsx";
import { useEventosContext } from "../../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../../utils/formato.js";
import {
  TIPOS_DOCUMENTO,
  RELACIONES_ITM,
  PROGRAMAS_ITM,
} from "../../../data/programasItm.js";
import estilos from "./DetalleEvento.module.css";

function construirUrlMapa(direccion) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(
    direccion
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}

export default function DetalleEvento() {
  const { id } = useParams();
  const { obtenerEvento, inscribir } = useEventosContext();
  const evento = obtenerEvento(id);

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
  });
  const [inscripcion, setInscripcion] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState("");

  const inscripcionRef = useRef(null);

  useEffect(() => {
    inscripcionRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (!evento || (evento.estado !== "publicado" && evento.estado !== "cancelado")) {
    return <Navigate to="/eventos" replace />;
  }

  const manejarCambio = (campo) => (eventoInput) => {
    let valor = eventoInput.target.value;
    if (campo === "telefono") {
      valor = valor.replace(/[^\d\s\-+()]/g, "");
    }
    if (campo === "numeroDocumento") {
      valor = valor.replace(/[^\w\-]/g, "");
    }
    setDatos((prev) => {
      const nuevos = { ...prev, [campo]: valor };
      if (campo === "relacionUniversidad" && valor !== "Estudiante") {
        nuevos.programaAcademico = "";
      }
      return nuevos;
    });
    if (error) setError("");
  };

  const manejarEnvio = (e) => {
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

    const resultado = inscribir({
      eventoId: evento.id,
      nombre,
      tipoDocumento,
      numeroDocumento,
      correo,
      telefono,
      relacionUniversidad,
      programaAcademico,
    });
    if (!resultado.exito) {
      setError(resultado.error);
      return;
    }
    setInscripcion(resultado.inscripcion);
    setConfirmada(true);
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
                src={evento.imagen}
                alt={evento.titulo}
                className={estilos.imagen}
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
            </div>

            {esMasivo ? (
              <div className={estilos.cajaMasivoConfirmacion}>
                <div className={estilos.badgeMasivoExito}>
                  <Sparkles className={estilos.iconoSparkle} aria-hidden="true" />
                  <span>Evento Masivo · Entrada Libre</span>
                </div>
                <p className={estilos.textoMasivoExito}>
                  Hemos registrado tus datos para llevar el control y aforo de participantes del evento.
                </p>
                <div className={estilos.avisoSinCorreo}>
                  <p>
                    Al ser un evento abierto y masivo con entrada libre, <strong>no requieres código de acceso</strong> ni se enviará confirmación a tu correo. ¡Solo acércate y disfruta del evento!
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
                      {PROGRAMAS_ITM.map((prog) => (
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

                <button type="submit" className={estilos.botonInscribirse}>
                  {esMasivo ? "Registrarme al evento" : "Inscribirme"}
                </button>
              </form>
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