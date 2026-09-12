import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { eventosIniciales } from "../data/eventos.js";
import {
  leerAlmacenamiento,
  escribirAlmacenamiento,
} from "../utils/almacenamiento.js";
import {
  listarEventos as listarEventosApi,
  listarEventosPublicados as listarEventosPublicadosApi,
  crearEvento as crearEventoApi,
  editarEvento as editarEventoApi,
  eliminarEvento as eliminarEventoApi,
  publicarEvento as publicarEventoApi,
  cancelarEvento as cancelarEventoApi,
  inscribir as inscribirApi,
  listarTodasInscripciones as listarTodasInscripcionesApi,
  validarInscripcion as validarInscripcionApi,
  marcarAsistencia as marcarAsistenciaApi,
} from "../api/servicios.js";
import { obtenerToken } from "../api/cliente.js";

const EventosContext = createContext(null);

function generarCodigo4Digitos(eventoId, inscripcionesExistentes = []) {
  // Códigos ya asignados en todo el observatorio (todos los eventos)
  const codigosGlobales = new Set(
    inscripcionesExistentes
      .filter((i) => i.codigo)
      .map((i) => String(i.codigo).trim())
  );

  // Códigos ya asignados a este evento específico
  const codigosDelEvento = new Set(
    inscripcionesExistentes
      .filter((i) => i.eventoId === Number(eventoId) && i.codigo)
      .map((i) => String(i.codigo).trim())
  );

  // 1. Prioridad: Código 100% único a nivel global (no se repite en ningún evento)
  for (let intentos = 0; intentos < 10000; intentos++) {
    const num = Math.floor(1000 + Math.random() * 9000).toString();
    if (!codigosGlobales.has(num)) {
      return num;
    }
  }

  // 2. Respaldo estricto: Si se llenaran los 9.000 códigos globales, asegurar que NO se repita en este evento
  for (let intentos = 0; intentos < 10000; intentos++) {
    const num = Math.floor(1000 + Math.random() * 9000).toString();
    if (!codigosDelEvento.has(num)) {
      return num;
    }
  }

  return Math.floor(1000 + Math.random() * 9000).toString();
}

function normalizarEventos(lista) {
  if (!Array.isArray(lista)) return [];
  const tiposValidos = ["abierto", "charla", "observacion"];
  return lista.map((ev) => {
    let tipo = ev.tipo;
    if (!tiposValidos.includes(tipo)) {
      tipo = "abierto";
    }
    const semilla = eventosIniciales.find((item) => item.id === ev.id);
    const esMasivo = ev.id === 2 ? true : Boolean(ev.esMasivo ?? semilla?.esMasivo);
    const creadoPorId =
      ev.creadoPorId || (Number(ev.id) % 2 === 0 ? 3 : 2);
    const creadoPorNombre =
      ev.creadoPorNombre ||
      (creadoPorId === 3 ? "Laura Gómez" : "Juan Camilo");
    const creadoPorRol = ev.creadoPorRol || "Docente";

    return {
      ...ev,
      tipo,
      esMasivo,
      creadoPorId,
      creadoPorNombre,
      creadoPorRol,
      capacidad: esMasivo
        ? null
        : Number(ev.capacidad) > 0
          ? Number(ev.capacidad)
          : 50,
      ubicacionMapa:
        ev.ubicacionMapa ||
        ev.lugar ||
        "Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
    };
  });
}

export function EventosProvider({ children }) {
  const [eventos, setEventos] = useState(() => {
    const almacenados = leerAlmacenamiento("itm_eventos", eventosIniciales);
    return normalizarEventos(almacenados);
  });
  const [inscripciones, setInscripciones] = useState(() =>
    leerAlmacenamiento("itm_inscripciones", [])
  );

  const cargarEventos = async () => {
    try {
      const token = obtenerToken();
      const datos = token
        ? await listarEventosApi()
        : await listarEventosPublicadosApi();
      if (Array.isArray(datos) && datos.length > 0) {
        setEventos(normalizarEventos(datos));
      }
    } catch {
      // Backend offline o sin conexión: mantener datos de almacenamiento
    }
  };

  const cargarInscripciones = async () => {
    try {
      const token = obtenerToken();
      if (token) {
        const datos = await listarTodasInscripcionesApi();
        if (Array.isArray(datos)) {
          setInscripciones(datos);
        }
      }
    } catch {
      // Ignorar error si no está autorizado
    }
  };

  useEffect(() => {
    cargarEventos();
    cargarInscripciones();
  }, []);

  useEffect(() => {
    escribirAlmacenamiento("itm_eventos", eventos);
  }, [eventos]);

  useEffect(() => {
    escribirAlmacenamiento("itm_inscripciones", inscripciones);
  }, [inscripciones]);

  const crearEvento = async (datos) => {
    try {
      const nuevo = await crearEventoApi(datos);
      const normalizado = normalizarEventos([nuevo])[0];
      setEventos((prev) => [...prev, normalizado]);
      return normalizado;
    } catch {
      const nuevoId =
        eventos.reduce((max, evento) => Math.max(max, evento.id), 0) + 1;
      const esMasivo = Boolean(datos.esMasivo);
      const capacidad = esMasivo
        ? null
        : Number(datos.capacidad) > 0
          ? Number(datos.capacidad)
          : 50;
      const ubicacionMapa =
        (datos.ubicacionMapa || "").trim() ||
        datos.lugar.trim() ||
        "Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia";

      const tiposValidos = ["abierto", "charla", "observacion"];
      const tipo = tiposValidos.includes(datos.tipo) ? datos.tipo : "abierto";

      const local = {
        id: nuevoId,
        titulo: datos.titulo.trim(),
        descripcion: datos.descripcion.trim(),
        fecha: datos.fecha,
        hora: datos.hora,
        lugar: datos.lugar.trim(),
        esMasivo,
        capacidad,
        ubicacionMapa,
        imagen: datos.imagen || "/images/Imagen.png",
        estado: datos.estado || "borrador",
        tipo,
        creadoPorId: datos.creadoPorId || 1,
        creadoPorNombre: datos.creadoPorNombre || "Administrador",
        creadoPorRol: datos.creadoPorRol || "Docente",
        inscritos: 0,
        asistentes: 0,
      };
      setEventos((prev) => [...prev, local]);
      return local;
    }
  };

  const editarEvento = async (id, cambios) => {
    try {
      const actualizado = await editarEventoApi(id, cambios);
      const normalizado = normalizarEventos([actualizado])[0];
      setEventos((prev) =>
        prev.map((evento) => (evento.id === id ? { ...evento, ...normalizado } : evento))
      );
      return normalizado;
    } catch {
      setEventos((prev) =>
        prev.map((evento) => {
          if (evento.id !== id) return evento;
          const actualizados = { ...evento, ...cambios };
          if (cambios.esMasivo !== undefined) {
            actualizados.esMasivo = Boolean(cambios.esMasivo);
            if (actualizados.esMasivo) {
              actualizados.capacidad = null;
            }
          }
          if (!actualizados.esMasivo && cambios.capacidad !== undefined) {
            actualizados.capacidad =
              Number(cambios.capacidad) > 0 ? Number(cambios.capacidad) : 50;
          }
          if (cambios.ubicacionMapa !== undefined) {
            actualizados.ubicacionMapa =
              (cambios.ubicacionMapa || "").trim() || actualizados.lugar;
          }
          if (cambios.tipo !== undefined) {
            const tiposValidos = ["abierto", "charla", "observacion"];
            actualizados.tipo = tiposValidos.includes(cambios.tipo)
              ? cambios.tipo
              : "abierto";
          }
          return actualizados;
        })
      );
    }
  };

  const eliminarEvento = async (id) => {
    try {
      await eliminarEventoApi(id);
    } catch {
      // Ignorar error red
    }
    setEventos((prev) => prev.filter((evento) => evento.id !== id));
  };

  const publicarEvento = async (id) => {
    try {
      await publicarEventoApi(id);
    } catch {
      // Fallback
    }
    setEventos((prev) =>
      prev.map((evento) =>
        evento.id === id ? { ...evento, estado: "publicado" } : evento
      )
    );
  };

  const cancelarEvento = async (id, motivo = "clima") => {
    try {
      await cancelarEventoApi(id, motivo);
    } catch {
      // Fallback
    }
    setEventos((prev) =>
      prev.map((evento) =>
        evento.id === id
          ? {
              ...evento,
              estado: "cancelado",
              motivoCancelacion: motivo,
            }
          : evento
      )
    );
  };

  const eventosPublicados = useMemo(
    () => eventos.filter((evento) => evento.estado === "publicado"),
    [eventos]
  );

  const obtenerEvento = (id) =>
    eventos.find((evento) => evento.id === Number(id));

  const conteoPorEstado = useMemo(
    () => ({
      publicado: eventos.filter((e) => e.estado === "publicado").length,
      borrador: eventos.filter((e) => e.estado === "borrador").length,
      cancelado: eventos.filter((e) => e.estado === "cancelado").length,
    }),
    [eventos]
  );

  const resumenDashboard = useMemo(
    () => ({
      eventosActivos: eventos.filter(
        (e) => e.estado === "publicado" && e.fecha >= new Date().toISOString().slice(0, 10)
      ).length,
      eventosFinalizados: eventos.filter(
        (e) => e.estado === "publicado" && e.fecha < new Date().toISOString().slice(0, 10)
      ).length,
      totalInscritos: inscripciones.length,
      totalAsistentes: inscripciones.filter((i) => i.asistencia === "Asistió").length,
      proximosEventos: eventos.filter(
        (e) => e.estado === "publicado" && e.fecha >= new Date().toISOString().slice(0, 10)
      ).length,
    }),
    [eventos, inscripciones]
  );

  const inscribir = async ({
    eventoId,
    nombre,
    tipoDocumento = "CC",
    numeroDocumento = "",
    correo,
    telefono,
    relacionUniversidad = "Externo",
    programaAcademico = "",
  }) => {
    const eventoActual = eventos.find((e) => e.id === Number(eventoId));
    if (eventoActual && !eventoActual.esMasivo) {
      const capacidad = Number(eventoActual.capacidad) > 0 ? Number(eventoActual.capacidad) : 50;
      const inscritos = Number(eventoActual.inscritos) || 0;
      if (inscritos >= capacidad) {
        return {
          exito: false,
          error: "Lo sentimos, los cupos para este evento ya se han agotado.",
        };
      }
    }

    try {
      const inscripcion = await inscribirApi({
        eventoId: Number(eventoId),
        nombre: (nombre || "").trim(),
        tipoDocumento,
        numeroDocumento: (numeroDocumento || "").trim(),
        correo: (correo || "").trim(),
        telefono: (telefono || "").trim(),
        relacionUniversidad,
        programaAcademico: (programaAcademico || "").trim(),
      });

      setInscripciones((prev) => [...prev, inscripcion]);
      setEventos((prev) =>
        prev.map((evento) =>
          evento.id === Number(eventoId)
            ? { ...evento, inscritos: (evento.inscritos || 0) + 1 }
            : evento
        )
      );

      return { exito: true, inscripcion };
    } catch (error) {
      if (error && (error.mensaje || error.message)) {
        return {
          exito: false,
          error: error.mensaje || error.message,
        };
      }

      // Fallback local si backend no responde
      const docLimpio = (numeroDocumento || "").trim().toLowerCase();
      const yaInscrito = inscripciones.some(
        (i) =>
          i.eventoId === Number(eventoId) &&
          (i.correo.toLowerCase() === correo.trim().toLowerCase() ||
            (docLimpio && i.numeroDocumento && i.numeroDocumento.toLowerCase() === docLimpio))
      );
      if (yaInscrito) {
        return {
          exito: false,
          error: "Ya existe una inscripción registrada con ese correo o número de documento.",
        };
      }

      const codigo = eventoActual?.esMasivo
        ? null
        : generarCodigo4Digitos(eventoId, inscripciones);

      const inscripcion = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        codigo,
        eventoId: Number(eventoId),
        nombre: nombre.trim(),
        tipoDocumento: tipoDocumento || "CC",
        numeroDocumento: (numeroDocumento || "").trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        relacionUniversidad: relacionUniversidad || "Otro",
        programaAcademico: (programaAcademico || "").trim(),
        asistencia: "Pendiente",
        fechaInscripcion: new Date().toISOString(),
        esMasivo: Boolean(eventoActual?.esMasivo),
      };

      setInscripciones((prev) => [...prev, inscripcion]);
      setEventos((prev) =>
        prev.map((evento) =>
          evento.id === Number(eventoId)
            ? { ...evento, inscritos: (evento.inscritos || 0) + 1 }
            : evento
        )
      );

      return { exito: true, inscripcion };
    }
  };

  const obtenerInscripcion = async (termino, eventoId = null) => {
    const limpio = (termino || "").trim();
    if (!limpio) {
      return { exito: false, error: "Ingresa el código, documento o correo del participante." };
    }

    try {
      const inscripcion = await validarInscripcionApi(limpio, eventoId);
      return { exito: true, inscripcion };
    } catch (error) {
      const mensaje = error?.mensaje || error?.message || "Registro no encontrado.";
      if (mensaje.includes("inscrito en otro evento")) {
        const otroEv = eventos.find((e) =>
          mensaje.toLowerCase().includes((e.titulo || "").toLowerCase())
        );
        return {
          exito: false,
          error: mensaje,
          otroEvento: otroEv,
        };
      }

      // Fallback local
      const query = limpio.toLowerCase();
      const local = inscripciones.find(
        (i) =>
          (eventoId ? i.eventoId === Number(eventoId) : true) &&
          ((i.codigo && i.codigo.toLowerCase() === query) ||
            (i.correo && i.correo.toLowerCase() === query) ||
            (i.numeroDocumento && i.numeroDocumento.toLowerCase() === query) ||
            (i.id && String(i.id).toLowerCase() === query))
      );

      if (local) {
        if (local.asistencia === "Asistió") {
          return {
            exito: false,
            error: "Este registro ya fue validado anteriormente.",
            inscripcion: local,
          };
        }
        return { exito: true, inscripcion: local };
      }

      if (eventoId) {
        const enOtro = inscripciones.find(
          (i) =>
            ((i.codigo && i.codigo.toLowerCase() === query) ||
              (i.correo && i.correo.toLowerCase() === query) ||
              (i.numeroDocumento && i.numeroDocumento.toLowerCase() === query) ||
              (i.id && String(i.id).toLowerCase() === query))
        );
        if (enOtro) {
          const ev = eventos.find((e) => e.id === enOtro.eventoId);
          return {
            exito: false,
            error: `El participante está inscrito en otro evento ("${ev?.titulo || "Otro evento"}"), no en el evento seleccionado.`,
            inscripcion: enOtro,
            otroEvento: ev,
          };
        }
      }

      return { exito: false, error: mensaje };
    }
  };

  const marcarAsistencia = async (termino, eventoId = null) => {
    const limpio = (termino || "").trim();
    if (!limpio) {
      return { exito: false, error: "Registro no encontrado." };
    }

    try {
      const inscripcion = await marcarAsistenciaApi(limpio, eventoId);

      setInscripciones((prev) =>
        prev.map((i) => {
          const coincide =
            (inscripcion.id && i.id === inscripcion.id) ||
            (inscripcion.codigo && i.codigo === inscripcion.codigo);
          return coincide ? { ...i, asistencia: "Asistió" } : i;
        })
      );

      setEventos((prev) =>
        prev.map((evento) =>
          evento.id === inscripcion.eventoId
            ? { ...evento, asistentes: (evento.asistentes || 0) + 1 }
            : evento
        )
      );

      return { exito: true, inscripcion };
    } catch (error) {
      // Fallback local
      const query = limpio.toLowerCase();
      const local = inscripciones.find(
        (i) =>
          (eventoId ? i.eventoId === Number(eventoId) : true) &&
          ((i.codigo && i.codigo.toLowerCase() === query) ||
            (i.correo && i.correo.toLowerCase() === query) ||
            (i.numeroDocumento && i.numeroDocumento.toLowerCase() === query) ||
            (i.id && String(i.id).toLowerCase() === query))
      );

      if (local) {
        if (local.asistencia === "Asistió") {
          return { exito: false, error: "Este registro ya fue validado anteriormente." };
        }

        setInscripciones((prev) =>
          prev.map((i) => {
            const coincide =
              (local.id && i.id === local.id) ||
              (local.codigo && i.codigo === local.codigo);
            return coincide ? { ...i, asistencia: "Asistió" } : i;
          })
        );
        setEventos((prev) =>
          prev.map((evento) =>
            evento.id === local.eventoId
              ? { ...evento, asistentes: (evento.asistentes || 0) + 1 }
              : evento
          )
        );

        return { exito: true, inscripcion: { ...local, asistencia: "Asistió" } };
      }

      return {
        exito: false,
        error: error?.mensaje || error?.message || "No se pudo confirmar la asistencia.",
      };
    }
  };

  const inscripcionesPorEvento = (eventoId) =>
    inscripciones.filter((i) => i.eventoId === Number(eventoId));

  const value = {
    eventos,
    eventosPublicados,
    obtenerEvento,
    crearEvento,
    editarEvento,
    eliminarEvento,
    publicarEvento,
    cancelarEvento,
    conteoPorEstado,
    resumenDashboard,
    inscripciones,
    inscribir,
    obtenerInscripcion,
    marcarAsistencia,
    inscripcionesPorEvento,
    cargarEventos,
    cargarInscripciones,
  };

  return <EventosContext.Provider value={value}>{children}</EventosContext.Provider>;
}

export function useEventosContext() {
  const context = useContext(EventosContext);
  if (!context) {
    throw new Error("useEventosContext debe usarse dentro de EventosProvider");
  }
  return context;
}
