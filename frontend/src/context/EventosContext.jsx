import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as api from "../api/servicios.js";
import { useAuth } from "./AuthContext.jsx";

const EventosContext = createContext(null);

export function EventosProvider({ children }) {
  const { estaAutenticado } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [inscripciones, setInscripciones] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const cargarTodos = async () => {
    try {
      setEventos(await api.listarEventos());
    } catch {
      guardarPublicos();
    }
  };

  const guardarPublicos = async () => {
    try {
      setEventos(await api.listarEventosPublicados());
    } catch {
      setEventos([]);
    }
  };

  useEffect(() => {
    if (estaAutenticado) {
      cargarTodos();
    } else {
      guardarPublicos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaAutenticado]);

  const eventosPublicados = useMemo(
    () => eventos.filter((evento) => evento.estado === "publicado"),
    [eventos]
  );

  const obtenerEvento = (id) =>
    eventos.find((evento) => evento.id === Number(id)) ?? null;

  const cargarEventoPublico = async (id) => {
    try {
      const evento = await api.obtenerEventoPublico(id);
      setEventos((prev) =>
        prev.some((e) => e.id === evento.id)
          ? prev.map((e) => (e.id === evento.id ? evento : e))
          : [...prev, evento]
      );
      return evento;
    } catch {
      return null;
    }
  };

  const crearEvento = async (datos) => {
    try {
      const evento = await api.crearEvento(datos);
      setEventos((prev) => [...prev, evento]);
      return { exito: true, evento };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo crear el evento." };
    }
  };

  const editarEvento = async (id, cambios) => {
    try {
      const evento = await api.editarEvento(id, cambios);
      setEventos((prev) => prev.map((e) => (e.id === evento.id ? evento : e)));
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo actualizar el evento." };
    }
  };

  const eliminarEvento = async (id) => {
    try {
      await api.eliminarEvento(id);
      setEventos((prev) => prev.filter((evento) => evento.id !== id));
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo eliminar el evento." };
    }
  };

  const cambiarEstado = async (id, estado, exitoTexto) => {
    try {
      const evento = estado === "publicado"
        ? await api.publicarEvento(id)
        : await api.cancelarEvento(id);
      setEventos((prev) => prev.map((e) => (e.id === evento.id ? evento : e)));
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || `No se pudo ${exitoTexto}.` };
    }
  };

  const publicarEvento = (id) => cambiarEstado(id, "publicado", "publicar el evento");
  const cancelarEvento = (id) => cambiarEstado(id, "cancelado", "cancelar el evento");

  const inscribir = async ({ eventoId, nombre, correo, telefono }) => {
    try {
      const inscripcion = await api.inscribir({ eventoId, nombre, correo, telefono });
      setInscripciones((prev) => [inscripcion, ...prev]);
      setEventos((prev) =>
        prev.map((evento) =>
          evento.id === Number(eventoId)
            ? { ...evento, inscritos: (evento.inscritos || 0) + 1 }
            : evento
        )
      );
      return { exito: true, inscripcion };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo completar la inscripción." };
    }
  };

  const obtenerInscripcion = async (codigo) => {
    try {
      const inscripcion = await api.validarInscripcion(codigo);
      return { exito: true, inscripcion };
    } catch (error) {
      return {
        exito: false,
        error: error.mensaje || "Código de registro no encontrado.",
        yaValidado: (error.mensaje || "").includes("ya fue validado"),
      };
    }
  };

  const marcarAsistencia = async (codigo) => {
    try {
      const inscripcion = await api.marcarAsistencia({ codigo });
      setInscripciones((prev) =>
        prev.map((i) => (i.codigo === inscripcion.codigo ? inscripcion : i))
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
      return { exito: false, error: error.mensaje || "No se pudo registrar la asistencia." };
    }
  };

  const cargarInscripcionesEvento = async (eventoId) => {
    try {
      const lista = await api.listarInscripcionesEvento(eventoId);
      setInscripciones((prev) => [
        ...prev.filter((i) => i.eventoId !== Number(eventoId)),
        ...lista,
      ]);
    } catch {
      // sin inscripciones o sin permisos
    }
  };

  const inscripcionesPorEvento = (eventoId) =>
    inscripciones.filter((i) => i.eventoId === Number(eventoId));

  const agregarFeedback = async ({ eventoId, nombre, calificacion, comentario }) => {
    try {
      const resena = await api.agregarFeedback({
        eventoId,
        nombre,
        calificacion: Number(calificacion),
        comentario,
      });
      setFeedback((prev) => [resena, ...prev]);
      return { exito: true, resena };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo enviar la opinión." };
    }
  };

  const cargarFeedbackEvento = async (eventoId) => {
    try {
      const lista = await api.listarFeedbackEvento(eventoId);
      setFeedback((prev) => [
        ...prev.filter((f) => f.eventoId !== Number(eventoId)),
        ...lista,
      ]);
    } catch {
      // sin feedback o sin permisos
    }
  };

  const feedbackPorEvento = (eventoId) =>
    feedback.filter((f) => f.eventoId === Number(eventoId));

  const conteoPorEstado = useMemo(
    () => ({
      publicado: eventos.filter((e) => e.estado === "publicado").length,
      borrador: eventos.filter((e) => e.estado === "borrador").length,
      cancelado: eventos.filter((e) => e.estado === "cancelado").length,
    }),
    [eventos]
  );

  const hoy = new Date().toISOString().slice(0, 10);
  const resumenDashboard = useMemo(
    () => ({
      eventosActivos: eventos.filter((e) => e.estado === "publicado" && e.fecha >= hoy).length,
      eventosFinalizados: eventos.filter((e) => e.estado === "publicado" && e.fecha < hoy).length,
      totalInscritos: eventos.reduce((acc, e) => acc + (e.inscritos || 0), 0),
      totalAsistentes: eventos.reduce((acc, e) => acc + (e.asistentes || 0), 0),
      proximosEventos: eventos.filter((e) => e.estado === "publicado" && e.fecha >= hoy).length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventos]
  );

  const value = {
    eventos,
    eventosPublicados,
    obtenerEvento,
    cargarEventoPublico,
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
    cargarInscripcionesEvento,
    inscripcionesPorEvento,
    feedback,
    agregarFeedback,
    cargarFeedbackEvento,
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