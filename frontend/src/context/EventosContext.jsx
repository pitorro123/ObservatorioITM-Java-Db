import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { eventosIniciales } from "../data/eventos.js";
import {
  leerAlmacenamiento,
  escribirAlmacenamiento,
} from "../utils/almacenamiento.js";

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

export function EventosProvider({ children }) {
  const [eventos, setEventos] = useState(() => {
    const almacenados = leerAlmacenamiento("itm_eventos", eventosIniciales);
    const tiposValidos = ["abierto", "charla", "observacion"];
    return almacenados.map((ev) => {
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
  });
  const [inscripciones, setInscripciones] = useState(() =>
    leerAlmacenamiento("itm_inscripciones", [])
  );

  useEffect(() => {
    escribirAlmacenamiento("itm_eventos", eventos);
  }, [eventos]);

  useEffect(() => {
    escribirAlmacenamiento("itm_inscripciones", inscripciones);
  }, [inscripciones]);

  const crearEvento = (datos) => {
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

    const evento = {
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
    setEventos((prev) => [...prev, evento]);
    return evento;
  };

  const editarEvento = (id, cambios) => {
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
  };

  const eliminarEvento = (id) => {
    setEventos((prev) => prev.filter((evento) => evento.id !== id));
  };

  const publicarEvento = (id) => {
    setEventos((prev) =>
      prev.map((evento) =>
        evento.id === id ? { ...evento, estado: "publicado" } : evento
      )
    );
  };

  const cancelarEvento = (id, motivo = "clima") => {
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

  const inscribir = ({
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

    // Para eventos masivos no se genera código ni se envía nada al correo
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
  };

  const obtenerInscripcion = (termino, eventoId = null) => {
    const limpio = (termino || "").trim().toLowerCase();
    if (!limpio) {
      return { exito: false, error: "Ingresa el código, documento o correo del participante." };
    }

    const inscripcion = inscripciones.find(
      (i) =>
        (eventoId ? i.eventoId === Number(eventoId) : true) &&
        ((i.codigo && i.codigo.toLowerCase() === limpio) ||
          (i.correo && i.correo.toLowerCase() === limpio) ||
          (i.numeroDocumento && i.numeroDocumento.toLowerCase() === limpio) ||
          (i.id && String(i.id).toLowerCase() === limpio))
    );

    if (!inscripcion) {
      if (eventoId) {
        const inscripcionEnOtro = inscripciones.find(
          (i) =>
            ((i.codigo && i.codigo.toLowerCase() === limpio) ||
              (i.correo && i.correo.toLowerCase() === limpio) ||
              (i.numeroDocumento && i.numeroDocumento.toLowerCase() === limpio) ||
              (i.id && String(i.id).toLowerCase() === limpio))
        );
        if (inscripcionEnOtro) {
          const ev = eventos.find((e) => e.id === inscripcionEnOtro.eventoId);
          return {
            exito: false,
            error: `El participante está inscrito en otro evento ("${ev?.titulo || "Otro evento"}"), no en el evento seleccionado.`,
            inscripcion: inscripcionEnOtro,
            otroEvento: ev,
          };
        }
      }
      return { exito: false, error: "Registro no encontrado. Verifica el código de 4 dígitos, documento o correo." };
    }
    if (inscripcion.asistencia === "Asistió") {
      return {
        exito: false,
        error: "Este registro ya fue validado anteriormente.",
        inscripcion,
      };
    }
    return { exito: true, inscripcion };
  };

  const marcarAsistencia = (termino, eventoId = null) => {
    const limpio = (termino || "").trim().toLowerCase();
    const inscripcion = inscripciones.find(
      (i) =>
        (eventoId ? i.eventoId === Number(eventoId) : true) &&
        ((i.codigo && i.codigo.toLowerCase() === limpio) ||
          (i.correo && i.correo.toLowerCase() === limpio) ||
          (i.numeroDocumento && i.numeroDocumento.toLowerCase() === limpio) ||
          (i.id && String(i.id).toLowerCase() === limpio))
    );

    if (!inscripcion) {
      if (eventoId) {
        const inscripcionEnOtro = inscripciones.find(
          (i) =>
            ((i.codigo && i.codigo.toLowerCase() === limpio) ||
              (i.correo && i.correo.toLowerCase() === limpio) ||
              (i.numeroDocumento && i.numeroDocumento.toLowerCase() === limpio) ||
              (i.id && String(i.id).toLowerCase() === limpio))
        );
        if (inscripcionEnOtro) {
          const ev = eventos.find((e) => e.id === inscripcionEnOtro.eventoId);
          return {
            exito: false,
            error: `Este participante está inscrito en "${ev?.titulo || "otro evento"}", no en este evento.`,
          };
        }
      }
      return { exito: false, error: "Registro no encontrado." };
    }
    if (inscripcion.asistencia === "Asistió") {
      return { exito: false, error: "Este registro ya fue validado anteriormente." };
    }

    const claveIdentificadora = inscripcion.id || inscripcion.codigo;

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

    return { exito: true, inscripcion: { ...inscripcion, asistencia: "Asistió" } };
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