import { useEffect, useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  QrCode,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Maximize2,
  ImagePlus,
  MapPin,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles,
  Lock,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext.jsx";
import { listarInscripcionesEvento } from "../../../../api/servicios.js";
import { exportarExcelFG031 } from "../../../../utils/exportarExcelFG031.js";
import ModalQrAsistencia from "../../../common/ModalQrAsistencia/ModalQrAsistencia.jsx";
import estilos from "./FormularioEvento.module.css";

const formularioVacio = {
  titulo: "",
  descripcion: "",
  fecha: "",
  hora: "",
  lugar: "",
  esMasivo: false,
  capacidad: 50,
  ubicacionMapa: "",
  imagen: "",
  tipo: "abierto",
  creadoPorId: null,
  creadoPorNombre: "",
  creadoPorRol: "Docente",
  publicarDirectamente: false,
};

const LUGARES_SUGERIDOS = [
  {
    nombreBoton: "Campus Fraternidad",
    lugar: "Observatorio Astronómico ITM - Sede Fraternidad",
    direccion:
      "Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
  },
  {
    nombreBoton: "Campus Robledo",
    lugar: "ITM - Campus Robledo",
    direccion:
      "Institución Universitaria ITM · Campus Robledo, Calle 73 #76A-354, Medellín, Antioquia",
  },
  {
    nombreBoton: "Parque Explora",
    lugar: "Parque Explora",
    direccion:
      "Parque Explora, Carrera 52 #73-75, Aranjuez, Medellín, Antioquia, Colombia",
  },
];

export default function FormularioEvento({
  abierto,
  evento,
  puedeEditar = true,
  onCerrar,
  onGuardar,
}) {
  const { usuarioActual, esAdmin, docentes } = useAuth();
  const [formulario, setFormulario] = useState(formularioVacio);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [descargandoExcel, setDescargandoExcel] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [mostrarModalProyeccion, setMostrarModalProyeccion] = useState(false);
  const qrRef = useRef(null);

  const esEdicion = Boolean(evento);

  useEffect(() => {
    if (!abierto) return;
    setError("");
    setCargando(false);
    if (evento) {
      const tiposValidos = ["abierto", "charla", "observacion"];
      const tipoValido = tiposValidos.includes(evento.tipo)
        ? evento.tipo
        : "abierto";

      const esMasivo = Boolean(evento.esMasivo);

      setFormulario({
        titulo: evento.titulo || "",
        descripcion: evento.descripcion || "",
        fecha: evento.fecha || "",
        hora: evento.hora || "",
        lugar: evento.lugar || "",
        esMasivo,
        capacidad: esMasivo ? "" : (evento.capacidad !== undefined ? evento.capacidad : 50),
        ubicacionMapa: evento.ubicacionMapa || "",
        imagen: evento.imagen || "",
        tipo: tipoValido,
        creadoPorId: evento.creadoPorId || usuarioActual?.id,
        creadoPorNombre: evento.creadoPorNombre || usuarioActual?.nombre || "Docente ITM",
        creadoPorRol: evento.creadoPorRol || usuarioActual?.rol || "Docente",
        publicarDirectamente: evento.estado === "publicado",
      });
    } else {
      setFormulario({
        ...formularioVacio,
        creadoPorId: usuarioActual?.id,
        creadoPorNombre: usuarioActual?.nombre || "Docente ITM",
        creadoPorRol: usuarioActual?.rol || "Docente",
      });
    }
  }, [abierto, evento, usuarioActual]);

  if (!abierto) return null;

  // URL a la que dirige el código QR para registrar la asistencia
  const origen =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://observatorio-itm-java-db-p1bi.vercel.app";
  const urlAsistencia = evento?.id
    ? `${origen}/eventos/${evento.id}?modo=asistencia`
    : "";

  const cambiarCampo = (clave) => (eventoInput) => {
    if (!puedeEditar) return;
    const valor =
      clave === "publicarDirectamente" || clave === "esMasivo"
        ? eventoInput.target.checked
        : eventoInput.target.value;
    setFormulario((prev) => ({ ...prev, [clave]: valor }));
    if (error) setError("");
  };

  const manejarImagen = (eventoInput) => {
    if (!puedeEditar) return;
    const archivo = eventoInput.target.files?.[0];
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      setError("La imagen es muy pesada. Por favor selecciona una de menos de 5 MB.");
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      setFormulario((prev) => ({ ...prev, imagen: lector.result }));
    };
    lector.readAsDataURL(archivo);
  };

  const copiarEnlace = async () => {
    if (!urlAsistencia) return;
    try {
      await navigator.clipboard.writeText(urlAsistencia);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback
    }
  };

  const descargarQrPng = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const size = 600;
    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const pngFile = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const tituloLimpio = (formulario.titulo || evento?.titulo || "evento")
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "_")
        .substring(0, 25);
      link.download = `QR_Asistencia_${tituloLimpio}_${evento?.id || "nuevo"}.png`;
      link.href = pngFile;
      link.click();
    };

    img.src =
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const manejarDescargarExcel = async () => {
    if (!evento?.id || descargandoExcel) return;
    setDescargandoExcel(true);
    try {
      const res = await listarInscripcionesEvento(evento.id);
      const lista = Array.isArray(res) ? res : res?.data || [];
      exportarExcelFG031(evento, lista);
    } catch (err) {
      console.error("Error al exportar FG 031:", err);
      setError("No se pudo generar el listado de asistencia en este momento.");
    } finally {
      setDescargandoExcel(false);
    }
  };

  const manejarEnvio = async (eventoForm) => {
    eventoForm.preventDefault();
    if (cargando || !puedeEditar) return;

    const titulo = formulario.titulo.trim();
    const descripcion = formulario.descripcion.trim();
    const lugar = formulario.lugar.trim();
    const ubicacionMapa = (formulario.ubicacionMapa || "").trim() || lugar;

    if (titulo.length < 3) {
      setError("Escribe el nombre del evento (mínimo 3 caracteres).");
      return;
    }
    if (descripcion.length < 10) {
      setError("Describe la actividad del evento (mínimo 10 caracteres).");
      return;
    }
    if (!formulario.fecha) {
      setError("Selecciona la fecha del evento.");
      return;
    }
    if (!formulario.hora) {
      setError("Selecciona la hora del evento.");
      return;
    }
    if (lugar.length < 3) {
      setError("Escribe el lugar del evento.");
      return;
    }

    let capacidadFinal = null;
    if (!formulario.esMasivo) {
      const capacidadNum = Number(formulario.capacidad);
      if (isNaN(capacidadNum) || capacidadNum < 1) {
        setError("Ingresa una capacidad de integrantes válida (mínimo 1 cupo).");
        return;
      }
      capacidadFinal = capacidadNum;
    }

    const datos = {
      titulo,
      descripcion,
      fecha: formulario.fecha,
      hora: formulario.hora,
      lugar,
      esMasivo: Boolean(formulario.esMasivo),
      capacidad: capacidadFinal,
      ubicacionMapa,
      imagen: formulario.imagen,
      tipo: formulario.tipo,
      creadoPorId: formulario.creadoPorId || usuarioActual?.id,
      creadoPorNombre:
        formulario.creadoPorNombre || usuarioActual?.nombre || "Docente ITM",
      creadoPorRol: formulario.creadoPorRol || usuarioActual?.rol || "Docente",
      estado: formulario.publicarDirectamente ? "publicado" : "borrador",
    };

    setCargando(true);
    setError("");
    try {
      await onGuardar(datos);
    } catch (err) {
      setError(
        err?.mensaje || err?.message || "No se pudo guardar el evento. Verifica los datos."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className={estilos.contenedorGestion} aria-label="Gestión de Evento">
      {/* Barra superior de navegación y título */}
      <div className={estilos.barraSuperior}>
        <div className={estilos.infoSuperior}>
          <button
            type="button"
            className={estilos.botonVolver}
            onClick={onCerrar}
            aria-label="Volver al listado de eventos"
          >
            <ArrowLeft className={estilos.iconoVolver} aria-hidden="true" />
            <span>Volver a Eventos</span>
          </button>
          <div className={estilos.titulos}>
            <h2 className={estilos.tituloPrincipal}>
              {esEdicion
                ? `Gestionar Evento: ${formulario.titulo || evento?.titulo || ""}`
                : "Crear nuevo evento"}
            </h2>
            <p className={estilos.subtituloPrincipal}>
              {esEdicion
                ? formulario.esMasivo
                  ? "Modifica los datos del evento, proyecta su código QR de asistencia en sitio y descarga la planilla oficial FG 031."
                  : "Modifica los datos del evento, gestiona la asistencia de los inscritos y descarga la planilla oficial FG 031."
                : "Diligencia la información para programar y publicar una nueva actividad en el Observatorio ITM."}
            </p>
          </div>
        </div>

        {esEdicion && (
          <div className={estilos.badgesCabecera}>
            <span
              className={`${estilos.insigniaEstado} ${
                evento.estado === "publicado"
                  ? estilos.estadoPublicado
                  : evento.estado === "cancelado"
                    ? estilos.estadoCancelado
                    : estilos.estadoBorrador
              }`}
            >
              {evento.estado === "publicado"
                ? "Publicado en Portal"
                : evento.estado === "cancelado"
                  ? "Cancelado"
                  : "Borrador"}
            </span>
            {formulario.esMasivo && (
              <span className={estilos.insigniaMasivo}>
                Aforo Libre (Evento Masivo)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cuadrícula de 2 columnas: Formulario a la izquierda, QR y Asistencia a la derecha */}
      <div className={estilos.gridGestion}>
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className={estilos.columnaFormulario}>
          <div className={estilos.tarjetaFormulario}>
            <div className={estilos.cabeceraTarjeta}>
              <h3 className={estilos.tituloSeccion}>
                {esEdicion ? "Detalles de la Actividad" : "Información del Evento"}
              </h3>
              {!puedeEditar && (
                <span className={estilos.badgeSoloLectura}>
                  <Lock size={14} aria-hidden="true" />
                  Modo solo lectura
                </span>
              )}
            </div>

            <form className={estilos.formulario} onSubmit={manejarEnvio} noValidate>
              {error && (
                <div className={estilos.alertaError} role="alert">
                  {error}
                </div>
              )}

              <div className={estilos.campo}>
                <label className={estilos.etiqueta} htmlFor="ev-titulo">
                  Nombre del evento *
                </label>
                <input
                  id="ev-titulo"
                  type="text"
                  required
                  disabled={!puedeEditar}
                  value={formulario.titulo}
                  onChange={cambiarCampo("titulo")}
                  className={estilos.input}
                  placeholder="Ej: Observación Astronómica con Telescopio"
                />
              </div>

              <div className={estilos.campo}>
                <label className={estilos.etiqueta} htmlFor="ev-descripcion">
                  Descripción de la actividad * (Mínimo 10 caracteres)
                </label>
                <textarea
                  id="ev-descripcion"
                  required
                  rows={4}
                  disabled={!puedeEditar}
                  value={formulario.descripcion}
                  onChange={cambiarCampo("descripcion")}
                  className={estilos.textarea}
                  placeholder="Describe los detalles, objetivos y actividades del evento para los participantes."
                />
              </div>

              <div className={estilos.fila}>
                <div className={estilos.campo}>
                  <label className={estilos.etiqueta} htmlFor="ev-fecha">
                    <Calendar className={estilos.iconoCampo} aria-hidden="true" />
                    Fecha *
                  </label>
                  <input
                    id="ev-fecha"
                    type="date"
                    required
                    disabled={!puedeEditar}
                    value={formulario.fecha}
                    onChange={cambiarCampo("fecha")}
                    className={estilos.input}
                  />
                </div>

                <div className={estilos.campo}>
                  <label className={estilos.etiqueta} htmlFor="ev-hora">
                    <Clock className={estilos.iconoCampo} aria-hidden="true" />
                    Hora *
                  </label>
                  <input
                    id="ev-hora"
                    type="time"
                    required
                    disabled={!puedeEditar}
                    value={formulario.hora}
                    onChange={cambiarCampo("hora")}
                    className={estilos.input}
                  />
                </div>
              </div>

              <div className={estilos.campo}>
                <label className={estilos.etiqueta} htmlFor="ev-lugar">
                  <MapPin className={estilos.iconoCampo} aria-hidden="true" />
                  Lugar / Espacio *
                </label>
                <input
                  id="ev-lugar"
                  type="text"
                  required
                  disabled={!puedeEditar}
                  value={formulario.lugar}
                  onChange={cambiarCampo("lugar")}
                  className={estilos.input}
                  placeholder="Ej: Observatorio ITM - Sede Fraternidad"
                />
                {puedeEditar && (
                  <div className={estilos.accesosRapidos}>
                    <span className={estilos.accesosRapidosEtiqueta}>
                      Sugerencias:
                    </span>
                    {LUGARES_SUGERIDOS.map((sug) => (
                      <button
                        key={sug.nombreBoton}
                        type="button"
                        className={estilos.botonSugerencia}
                        onClick={() => {
                          setFormulario((prev) => ({
                            ...prev,
                            lugar: sug.lugar,
                            ubicacionMapa: sug.direccion,
                          }));
                          if (error) setError("");
                        }}
                      >
                        {sug.nombreBoton}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={estilos.campo}>
                <label className={estilos.etiqueta} htmlFor="ev-ubicacion-mapa">
                  Dirección exacta para el mapa
                </label>
                <input
                  id="ev-ubicacion-mapa"
                  type="text"
                  disabled={!puedeEditar}
                  value={formulario.ubicacionMapa}
                  onChange={cambiarCampo("ubicacionMapa")}
                  className={estilos.input}
                  placeholder="Dirección completa para Google Maps / OpenStreetMap"
                />
              </div>

              <div className={estilos.fila}>
                <div className={estilos.campo}>
                  <label className={estilos.cajaMasivo}>
                    <input
                      type="checkbox"
                      disabled={!puedeEditar}
                      checked={formulario.esMasivo}
                      onChange={cambiarCampo("esMasivo")}
                      className={estilos.checkbox}
                    />
                    <div className={estilos.textoMasivo}>
                      <strong>Evento masivo (Aforo libre)</strong>
                      <span>Cupos ilimitados. Habilita asistencia por código QR en sitio.</span>
                    </div>
                  </label>
                </div>

                <div className={estilos.campo}>
                  <label className={estilos.etiqueta} htmlFor="ev-capacidad">
                    <Users className={estilos.iconoCampo} aria-hidden="true" />
                    Capacidad de participantes
                  </label>
                  <input
                    id="ev-capacidad"
                    type="number"
                    min="1"
                    disabled={!puedeEditar || formulario.esMasivo}
                    value={formulario.esMasivo ? "" : formulario.capacidad}
                    onChange={cambiarCampo("capacidad")}
                    className={`${estilos.input} ${
                      formulario.esMasivo ? estilos.inputDeshabilitado : ""
                    }`}
                    placeholder={formulario.esMasivo ? "Ilimitada" : "50"}
                  />
                </div>
              </div>

              <div className={estilos.fila}>
                <div className={estilos.campo}>
                  <label className={estilos.etiqueta} htmlFor="ev-tipo">
                    Tipo de evento
                  </label>
                  <select
                    id="ev-tipo"
                    disabled={!puedeEditar}
                    value={formulario.tipo}
                    onChange={cambiarCampo("tipo")}
                    className={`${estilos.input} ${estilos.select}`}
                  >
                    <option value="abierto">Abierto / General</option>
                    <option value="charla">Charla Académica</option>
                    <option value="observacion">Observación con Telescopio</option>
                  </select>
                </div>

                <div className={estilos.campo}>
                  <label className={estilos.etiqueta} htmlFor="ev-docente">
                    <GraduationCap className={estilos.iconoCampo} aria-hidden="true" />
                    Docente responsable
                  </label>
                  {esAdmin ? (
                    <select
                      id="ev-docente"
                      disabled={!puedeEditar}
                      value={formulario.creadoPorId || usuarioActual?.id}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const doc =
                          docentes.find((d) => d.id === id) ||
                          (id === usuarioActual?.id ? usuarioActual : null);
                        setFormulario((prev) => ({
                          ...prev,
                          creadoPorId: id,
                          creadoPorNombre: doc ? doc.nombre : "Docente ITM",
                          creadoPorRol: doc ? doc.rol : "Docente",
                        }));
                      }}
                      className={`${estilos.input} ${estilos.select}`}
                    >
                      {docentes.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.nombre} ({doc.correo})
                        </option>
                      ))}
                      <option value={usuarioActual?.id}>
                        {usuarioActual?.nombre} (Administrador)
                      </option>
                    </select>
                  ) : (
                    <div className={estilos.docenteAsignadoFila}>
                      <GraduationCap className={estilos.iconoDocenteAsignado} aria-hidden="true" />
                      <span>{formulario.creadoPorNombre || usuarioActual?.nombre || "Docente ITM"}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={estilos.campo}>
                <label className={estilos.etiqueta}>Imagen del evento</label>
                <div className={estilos.grupoImagen}>
                  {formulario.imagen && (
                    <img
                      src={formulario.imagen}
                      alt="Vista previa del evento"
                      className={estilos.vistaPrevia}
                    />
                  )}
                  {puedeEditar && (
                    <label className={estilos.botonImagen}>
                      <ImagePlus className={estilos.iconoImagen} aria-hidden="true" />
                      <span>{formulario.imagen ? "Cambiar imagen" : "Subir imagen"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={manejarImagen}
                        className={estilos.inputArchivo}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className={estilos.campoPublicar}>
                <label className={estilos.cajaPublicar}>
                  <input
                    type="checkbox"
                    disabled={!puedeEditar}
                    checked={formulario.publicarDirectamente}
                    onChange={cambiarCampo("publicarDirectamente")}
                    className={estilos.checkbox}
                  />
                  <span>Publicar directamente en el portal web</span>
                </label>
                <p className={estilos.ayudaPublicar}>
                  Si no se marca, el evento se guardará como <strong>borrador</strong> privado.
                </p>
              </div>

              <div className={estilos.accionesFormulario}>
                <button
                  type="button"
                  className={estilos.botonCancelar}
                  onClick={onCerrar}
                  disabled={cargando}
                >
                  Volver / Cancelar
                </button>
                {puedeEditar && (
                  <button
                    type="submit"
                    className={estilos.botonGuardar}
                    disabled={cargando}
                  >
                    {cargando
                      ? esEdicion
                        ? "Guardando cambios..."
                        : "Creando evento..."
                      : esEdicion
                        ? "Guardar cambios"
                        : "Crear evento"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: QR del evento (arriba) y Descarga FG 031 (abajo) */}
        <aside className={estilos.columnaLateral}>
          {/* TARJETA 1: CÓDIGO QR (SOLO EVENTOS MASIVOS) O CONTROL DE CUPOS (NO MASIVOS) */}
          {formulario.esMasivo ? (
            <div className={estilos.tarjetaLateral}>
              <div className={estilos.cabeceraLateral}>
                <div className={estilos.iconoContenedorQr}>
                  <QrCode className={estilos.iconoLateral} aria-hidden="true" />
                </div>
                <div>
                  <h3 className={estilos.tituloLateral}>Código QR del Evento</h3>
                  <span className={estilos.badgeLateral}>Toma de Asistencia en Sitio</span>
                </div>
              </div>

              {esEdicion ? (
                <div className={estilos.cuerpoQr}>
                  <p className={estilos.descripcionLateral}>
                    Proyecta este código en el aula o auditorio para que los estudiantes
                    escaneen y registren su asistencia inmediatamente.
                  </p>

                  <div className={estilos.marcoQr} ref={qrRef}>
                    <QRCodeSVG
                      value={urlAsistencia}
                      size={210}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <div className={estilos.cajaEnlace}>
                    <input
                      type="text"
                      readOnly
                      value={urlAsistencia}
                      className={estilos.inputEnlace}
                      aria-label="Enlace directo al formulario de asistencia"
                    />
                    <button
                      type="button"
                      onClick={copiarEnlace}
                      className={estilos.botonCopiar}
                      title="Copiar enlace"
                    >
                      {copiado ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                      <span>{copiado ? "¡Copiado!" : "Copiar"}</span>
                    </button>
                  </div>

                  <div className={estilos.botonesQr}>
                    <button
                      type="button"
                      onClick={descargarQrPng}
                      className={estilos.botonDescargarQr}
                    >
                      <Download size={16} aria-hidden="true" />
                      <span>Descargar QR (PNG)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMostrarModalProyeccion(true)}
                      className={estilos.botonProyectar}
                    >
                      <Maximize2 size={16} aria-hidden="true" />
                      <span>Proyectar Pantalla Completa</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className={estilos.placeholderLateral}>
                  <div className={estilos.iconoPlaceholder}>
                    <QrCode size={40} aria-hidden="true" />
                  </div>
                  <h4>Código QR Automático</h4>
                  <p>
                    Una vez crees y guardes el evento masivo, aquí aparecerá automáticamente su
                    código QR oficial para proyectar a los asistentes.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className={estilos.tarjetaLateral}>
              <div className={estilos.cabeceraLateral}>
                <div className={estilos.iconoContenedorCupos}>
                  <Users className={estilos.iconoLateral} aria-hidden="true" />
                </div>
                <div>
                  <h3 className={estilos.tituloLateral}>Control de Asistencia</h3>
                  <span className={estilos.badgeCupos}>
                    Aforo limitado ({formulario.capacidad || 50} cupos)
                  </span>
                </div>
              </div>

              <div className={estilos.cuerpoCupos}>
                <p className={estilos.descripcionLateral}>
                  Este evento cuenta con cupos limitados y no utiliza código QR en sitio. Los participantes deben preinscribirse en la web.
                </p>

                <div className={estilos.cajaInfoCupos}>
                  <div className={estilos.itemInfoCupos}>
                    <span className={estilos.etiquetaInfoCupos}>Modalidad:</span>
                    <strong>Inscripción previa web</strong>
                  </div>
                  <div className={estilos.itemInfoCupos}>
                    <span className={estilos.etiquetaInfoCupos}>Validación en sitio:</span>
                    <strong>Código 4 dígitos / Cédula</strong>
                  </div>
                  {esEdicion && (
                    <div className={estilos.itemInfoCupos}>
                      <span className={estilos.etiquetaInfoCupos}>Inscritos actuales:</span>
                      <strong>{evento?.inscritos || 0} de {formulario.capacidad || 50}</strong>
                    </div>
                  )}
                </div>

                <div className={estilos.avisoNoQr}>
                  <p>
                    💡 El código QR de asistencia en pantalla está habilitado únicamente para <strong>eventos masivos</strong> con aforo libre.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TARJETA 2: DESCARGA DE ASISTENCIA OFICIAL ITM (FG 031) */}
          <div className={estilos.tarjetaLateral}>
            <div className={estilos.cabeceraLateral}>
              <div className={estilos.iconoContenedorExcel}>
                <FileSpreadsheet className={estilos.iconoLateral} aria-hidden="true" />
              </div>
              <div>
                <h3 className={estilos.tituloLateral}>Listado de Asistencia</h3>
                <span className={estilos.badgeFormatoOficial}>Formato Oficial FG 031</span>
              </div>
            </div>

            {esEdicion ? (
              <div className={estilos.cuerpoAsistencia}>
                <p className={estilos.descripcionLateral}>
                  Descarga la planilla oficial del ITM en formato Excel con todos los
                  asistentes e inscritos confirmados, lista para radicar en coordinación docente.
                </p>

                {/* Métricas rápidas del evento */}
                <div className={estilos.metricasAsistencia}>
                  <div className={estilos.metricaItem}>
                    <span className={estilos.metricaValor}>
                      {evento.asistentes || 0}
                    </span>
                    <span className={estilos.metricaEtiqueta}>Asistieron</span>
                  </div>
                  <div className={estilos.metricaDivisor} />
                  <div className={estilos.metricaItem}>
                    <span className={estilos.metricaValor}>
                      {evento.esMasivo
                        ? "Ilimitado"
                        : evento.inscritos || 0}
                    </span>
                    <span className={estilos.metricaEtiqueta}>
                      {evento.esMasivo ? "Aforo libre" : "Inscritos"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={manejarDescargarExcel}
                  disabled={descargandoExcel}
                  className={estilos.botonDescargarExcel}
                >
                  <FileSpreadsheet size={18} aria-hidden="true" />
                  <span>
                    {descargandoExcel
                      ? "Generando archivo Excel..."
                      : "Descargar Asistencia (Excel)"}
                  </span>
                </button>

                <div className={estilos.notaOficial}>
                  <Sparkles size={14} className={estilos.iconoChispa} aria-hidden="true" />
                  <span>
                    Cumple con el estándar de Calidad ITM (Código FG 031 · Versión 03).
                  </span>
                </div>
              </div>
            ) : (
              <div className={estilos.placeholderLateral}>
                <div className={estilos.iconoPlaceholder}>
                  <FileSpreadsheet size={40} aria-hidden="true" />
                </div>
                <h4>Planilla FG 031 en Excel</h4>
                <p>
                  Podrás descargar el archivo Excel con todos los asistentes registrados
                  tan pronto los estudiantes completen el formulario del evento.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Modal de Proyección en Pantalla Completa (cuando le den a proyectar en eventos masivos) */}
      {evento && formulario.esMasivo && (
        <ModalQrAsistencia
          abierto={mostrarModalProyeccion}
          onCerrar={() => setMostrarModalProyeccion(false)}
          evento={evento}
        />
      )}
    </section>
  );
}