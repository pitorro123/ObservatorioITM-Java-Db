import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { eventosIniciales } from "../data/eventos.js";
import {
  leerAlmacenamiento,
  escribirAlmacenamiento,
} from "../utils/almacenamiento.js";

const EventosContext = createContext(null);

function generarCodigoInscripcion() {
  const sufijo = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ITM-${Date.now().toString(36).toUpperCase()}-${sufijo}`;
}

export function EventosProvider({ children }) {
  const [eventos, setEventos] = useState(() =>
    leerAlmacenamiento("itm_eventos", eventosIniciales)
  );
  const [inscripciones, setInscripciones] = useState(() =>
    leerAlmacenamiento("itm_inscripciones", [])
  );
  const [feedback, setFeedback] = useState(() =>
    leerAlmacenamiento("itm_feedback", [])
  );

  useEffect(() => {
    escribirAlmacenamiento("itm_eventos", eventos);
  }, [eventos]);

  useEffect(() => {
    escribirAlmacenamiento("itm_inscripciones", inscripciones);
  }, [inscripciones]);

  useEffect(() => {
    escribirAlmacenamiento("itm_feedback", feedback);
  }, [feedback]);

  const crearEvento = (datos) => {
    const nuevoId =
      eventos.reduce((max, evento) => Math.max(max, evento.id), 0) + 1;
    const evento = {
      id: nuevoId,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      fecha: datos.fecha,
      hora: datos.hora,
      lugar: datos.lugar.trim(),
      imagen: datos.imagen || "/images/Imagen.png",
      estado: datos.estado || "borrador",
      tipo: datos.tipo || "abierto",
      inscritos: 0,
      asistentes: 0,
    };
    setEventos((prev) => [...prev, evento]);
    return evento;
  };

  const editarEvento = (id, cambios) => {
    setEventos((prev) =>
      prev.map((evento) => (evento.id === id ? { ...evento, ...cambios } : evento))
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

  const cancelarEvento = (id) => {
    setEventos((prev) =>
      prev.map((evento) =>
        evento.id === id ? { ...evento, estado: "cancelado" } : evento
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

  const inscribir = ({ eventoId, nombre, correo, telefono }) => {
    const yaInscrito = inscripciones.some(
      (i) =>
        i.eventoId === Number(eventoId) &&
        i.correo.toLowerCase() === correo.trim().toLowerCase()
    );
    if (yaInscrito) {
      return { exito: false, error: "Ya estás inscrito en este evento con ese correo." };
    }

    const codigo = generarCodigoInscripcion();
    const inscripcion = {
      codigo,
      eventoId: Number(eventoId),
      nombre: nombre.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
      asistencia: "Pendiente",
      fechaInscripcion: new Date().toISOString(),
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

  const obtenerInscripcion = (codigo) => {
    const inscripcion = inscripciones.find(
      (i) => i.codigo.toLowerCase() === (codigo || "").trim().toLowerCase()
    );
    if (!inscripcion) {
      return { exito: false, error: "Código de registro no encontrado." };
    }
    if (inscripcion.asistencia === "Asistió") {
      return {
        exito: false,
        error: "Este código ya fue validado anteriormente.",
        inscripcion,
      };
    }
    return { exito: true, inscripcion };
  };

  const marcarAsistencia = (codigo) => {
    const inscripcion = inscripciones.find(
      (i) => i.codigo.toLowerCase() === (codigo || "").trim().toLowerCase()
    );
    if (!inscripcion) {
      return { exito: false, error: "Código de registro no encontrado." };
    }
    if (inscripcion.asistencia === "Asistió") {
      return { exito: false, error: "Este código ya fue validado anteriormente." };
    }

    setInscripciones((prev) =>
      prev.map((i) =>
        i.codigo === inscripcion.codigo ? { ...i, asistencia: "Asistió" } : i
      )
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

  const agregarFeedback = ({ eventoId, nombre, calificacion, comentario }) => {
    const nombreLimpio = (nombre || "").trim();

    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return { exito: false, error: "Selecciona una calificación de 1 a 5 estrellas." };
    }

    const yaComento = feedback.some(
      (f) =>
        f.eventoId === Number(eventoId) &&
        (f.nombre || "").toLowerCase() === nombreLimpio.toLowerCase()
    );
    if (nombreLimpio && yaComento) {
      return { exito: false, error: "Ya enviaste tu opinión para este evento." };
    }

    const resena = {
      id: feedback.reduce((max, f) => Math.max(max, f.id), 0) + 1,
      eventoId: Number(eventoId),
      nombre: nombreLimpio || "Anónimo",
      calificacion: Number(calificacion),
      comentario: (comentario || "").trim(),
      fecha: new Date().toISOString(),
    };

    setFeedback((prev) => [...prev, resena]);
    return { exito: true, resena };
  };

  const feedbackPorEvento = (eventoId) =>
    feedback.filter((f) => f.eventoId === Number(eventoId));

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
    feedback,
    agregarFeedback,
    feedbackPorEvento,
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