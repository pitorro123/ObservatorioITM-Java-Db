import { useState, useEffect, useRef } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  Navigation,
  Download,
  Star,
  MessageSquareHeart,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEventosContext } from "../../../context/EventosContext.jsx";
import { formatearFecha, formatearHora } from "../../../utils/formato.js";
import estilos from "./DetalleEvento.module.css";

const UBICACION = {
  lat: 6.2451243,
  lng: -75.5499752,
  direccion: "Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
};

function construirUrlMapa() {
  const { lat, lng } = UBICACION;
  const margen = 0.004;
  return (
    `https://www.openstreetmap.org/export/embed.html?` +
    `bbox=${lng - margen}%2C${lat - margen}%2C${lng + margen}%2C${lat + margen}` +
    `&layer=mapnik&marker=${lat}%2C${lng}`
  );
}

const enlaceRuta = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  "ITM Campus Fraternidad, Calle 54A #30-01, Medellín, Antioquia"
)}`;

export default function DetalleEvento() {
  const { id } = useParams();
  const { obtenerEvento, inscribir, agregarFeedback, feedbackPorEvento } =
    useEventosContext();
  const evento = obtenerEvento(id);
  const reseñas = evento ? feedbackPorEvento(evento.id) : [];

  const [confirmada, setConfirmada] = useState(false);
  const [datos, setDatos] = useState({ nombre: "", correo: "", telefono: "" });
  const [inscripcion, setInscripcion] = useState(null);
  const [error, setError] = useState("");

  const [opinion, setOpinion] = useState({ nombre: "", calificacion: 0, comentario: "" });
  const [errorOpinion, setErrorOpinion] = useState("");
  const [opinionEnviada, setOpinionEnviada] = useState(null);

  const inscripcionRef = useRef(null);

  useEffect(() => {
    inscripcionRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (!evento || evento.estado !== "publicado") {
    return <Navigate to="/eventos" replace />;
  }

  const manejarCambio = (campo) => (eventoInput) => {
    let valor = eventoInput.target.value;
    if (campo === "telefono") {
      valor = valor.replace(/[^\d\s\-+()]/g, "");
    }
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (error) setError("");
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim();
    const telefono = datos.telefono.trim();

    if (!nombre) {
      setError("Escribe tu nombre completo.");
      return;
    }

    const palabrasNombre = nombre.split(/\s+/).filter(Boolean);
    const palabraValida = (palabra) =>
      /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ']{2,}$/.test(palabra) &&
      /[aeiouáéíóúü]/i.test(palabra);

    if (palabrasNombre.length < 2) {
      setError("Ingresa tu nombre y apellido.");
      return;
    }
    if (!palabrasNombre.every(palabraValida)) {
      setError("El nombre no parece real. Escribe tu nombre y apellido.");
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

    const resultado = inscribir({
      eventoId: evento.id,
      nombre,
      correo,
      telefono,
    });
    if (!resultado.exito) {
      setError(resultado.error);
      return;
    }
    setInscripcion(resultado.inscripcion);
    setConfirmada(true);
  };

  const descargarQr = () => {
    const canvas = document.getElementById("qr-inscripcion");
    if (!canvas) return;
    const enlace = canvas.toDataURL("image/png");
    const enlaceDescarga = document.createElement("a");
    enlaceDescarga.href = enlace;
    enlaceDescarga.download = `QR-${inscripcion.codigo}.png`;
    enlaceDescarga.click();
  };

  const promedio = reseñas.reduce((acc, r) => acc + r.calificacion, 0) / reseñas.length;

  const manejarEnvioOpinion = (e) => {
    e.preventDefault();
    setErrorOpinion("");

    if (!opinion.calificacion) {
      setErrorOpinion("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }
    if (opinion.comentario.trim().length > 0 && opinion.comentario.trim().length < 3) {
      setErrorOpinion("El comentario debe tener al menos 3 caracteres.");
      return;
    }

    const resultado = agregarFeedback({ eventoId: evento.id, ...opinion });
    if (!resultado.exito) {
      setErrorOpinion(resultado.error);
      return;
    }
    setOpinionEnviada(resultado.resena);
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
            {evento.tipo === "semillero" && (
              <span className={estilos.badgeSemillero}>Semillero de astronomía</span>
            )}
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
            </ul>
          </div>
        </div>

        <div className={estilos.inscripcion} ref={inscripcionRef}>
        {confirmada && inscripcion ? (
          <div className={estilos.confirmacion} role="status">
            <CheckCircle2 className={estilos.iconoExito} aria-hidden="true" />
            <h2 className={estilos.confirmacionTitulo}>
              ¡Inscripción confirmada, {datos.nombre || "participante"}!
            </h2>
            <p className={estilos.confirmacionTexto}>
              Te esperamos en {evento.lugar} el {formatearFecha(evento.fecha)} a las{" "}
              {formatearHora(evento.hora)}. Guarda tu código QR de asistencia.
            </p>

            <div className={estilos.qrBox}>
              <span className={estilos.qrTitulo}>Tu código de asistencia</span>
              <QRCodeSVG
                id="qr-inscripcion"
                value={inscripcion.codigo}
                size={168}
                className={estilos.qr}
              />
              <p className={estilos.qrCodigo}>{inscripcion.codigo}</p>
              <p className={estilos.qrAyuda}>
                Muestra este código al ingresar al evento. También puedes consultar tu
                asistencia desde el panel docente.
              </p>
              <button
                type="button"
                className={estilos.botonDescargar}
                onClick={descargarQr}
              >
                <Download className={estilos.iconoBoton} aria-hidden="true" />
                Descargar QR
              </button>
            </div>

            <Link to="/eventos" className={estilos.enlaceVolver}>
              Ver más eventos
            </Link>
          </div>
        ) : (
          <>
            <h2 className={estilos.inscripcionTitulo}>Inscríbete a este evento</h2>
            <p className={estilos.inscripcionTexto}>
              Completa tus datos para reservar tu cupo. La entrada es gratuita.
            </p>

            <form className={estilos.formulario} onSubmit={manejarEnvio} noValidate>
              {error && (
                <p className={estilos.errorForm} role="alert">
                  {error}
                </p>
              )}

              <div className={estilos.campo}>
                <label className={estilos.etiqueta} htmlFor="nombre">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  value={datos.nombre}
                  onChange={manejarCambio("nombre")}
                  className={estilos.input}
                  placeholder="Tu nombre"
                />
              </div>

              <div className={estilos.campo}>
                <label className={estilos.etiqueta} htmlFor="correo">
                  Correo electrónico
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
                  Teléfono / Celular
                </label>
                <input
                  id="telefono"
                  type="tel"
                  required
                  value={datos.telefono}
                  onChange={manejarCambio("telefono")}
                  className={estilos.input}
                  placeholder="300 000 0000"
                  maxLength={16}
                />
              </div>

              <button type="submit" className={estilos.botonInscribirse}>
                Inscribirme
              </button>
            </form>
          </>
        )}
        </div>

        <div className={estilos.ubicacion}>
        <div className={estilos.ubicacionHeader}>
          <h2 className={estilos.ubicacionTitulo}>¿Cómo llegar?</h2>
          <p className={estilos.ubicacionTexto}>
            El evento se realiza en la {UBICACION.direccion}. Usa el mapa para ubicarte.
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
            {UBICACION.direccion}
          </div>
          <iframe
            src={construirUrlMapa()}
            title={`Mapa de ubicación del evento ${evento.titulo}`}
            className={estilos.mapa}
            loading="lazy"
          />
        </div>
        </div>
      </div>

      <section className={estilos.reseñas} aria-label="Opiniones sobre el evento">
        <div className={estilos.reseñasResumen}>
          <p className={estilos.etiquetaReseñas}>Opiniones de los asistentes</p>
          <h2 className={estilos.tituloReseñas}>¿Qué te pareció este evento?</h2>
          <p className={estilos.textoReseñas}>
            Comparte tu experiencia con la comunidad del observatorio.
          </p>

          {reseñas.length > 0 && (
            <span className={estilos.resumenEstrellas}>
              <span className={estilos.estrellasMostrar} aria-label={`${promedio.toFixed(1)} de 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={estilos.estrellaMostrar}
                    fill={n <= Math.round(promedio) ? "currentColor" : "none"}
                    aria-hidden="true"
                  />
                ))}
              </span>
              <strong>{promedio.toFixed(1)}</strong>
              <span>· {reseñas.length} {reseñas.length === 1 ? "reseña" : "reseñas"}</span>
            </span>
          )}
        </div>

        {opinionEnviada ? (
          <div className={estilos.opinionExito} role="status">
            <CheckCircle2 className={estilos.iconoExito} aria-hidden="true" />
            <p className={estilos.confirmacionTitulo}>¡Gracias por tu opinión!</p>
            <p className={estilos.confirmacionTexto}>
              Tu calificación y comentario ya están visibles en esta página.
            </p>
          </div>
        ) : (
          <form className={estilos.formularioResenas} onSubmit={manejarEnvioOpinion} noValidate>
            {errorOpinion && (
              <p className={estilos.errorForm} role="alert">
                {errorOpinion}
              </p>
            )}

            <div className={estilos.campo}>
              <span className={estilos.etiqueta}>Tu calificación</span>
              <div className={estilos.estrellas}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={estilos.botonEstrella}
                    onClick={() => setOpinion((prev) => ({ ...prev, calificacion: n }))}
                    aria-label={`${n} estrellas`}
                  >
                    <Star
                      className={estilos.estrella}
                      fill={n <= opinion.calificacion ? "currentColor" : "none"}
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={estilos.campo}>
              <label className={estilos.etiqueta} htmlFor="opinion-nombre">
                Tu nombre
              </label>
              <input
                id="opinion-nombre"
                type="text"
                value={opinion.nombre}
                onChange={(e) => setOpinion((prev) => ({ ...prev, nombre: e.target.value }))}
                className={estilos.input}
                placeholder="Ej. Mariana Restrepo"
              />
            </div>

            <div className={estilos.campo}>
              <label className={estilos.etiqueta} htmlFor="opinion-comentario">
                Tu comentario
              </label>
              <textarea
                id="opinion-comentario"
                rows={4}
                value={opinion.comentario}
                onChange={(e) => setOpinion((prev) => ({ ...prev, comentario: e.target.value }))}
                className={estilos.textarea}
                placeholder="Cuéntanos qué te gustó o cómo podríamos mejorar la experiencia."
              />
            </div>

            <button type="submit" className={estilos.botonInscribirse}>
              <MessageSquareHeart className={estilos.iconoBoton} aria-hidden="true" />
              Enviar opinión
            </button>
          </form>
        )}

        {reseñas.length > 0 && (
          <div className={estilos.listaResenas}>
            {reseñas.map((reseña) => (
              <article key={reseña.id} className={estilos.tarjetaResena}>
                <div className={estilos.cabeceraResena}>
                  <div>
                    <p className={estilos.nombreResena}>{reseña.nombre}</p>
                    <p className={estilos.fechaResena}>
                      {new Date(reseña.fecha).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <span className={estilos.estrellasMostrar}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={estilos.estrellaMini}
                        fill={n <= reseña.calificacion ? "currentColor" : "none"}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                </div>
                {reseña.comentario && <p className={estilos.comentarioResena}>{reseña.comentario}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}