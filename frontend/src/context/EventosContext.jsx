import { createContext, useContext, useEffect, useMemo, useState } from "react";
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

function normalizarEventos(lista) {
  if (!Array.isArray(lista)) return [];
  const tiposValidos = ["abierto", "charla", "observacion"];
  return lista.map((ev) => {
    let tipo = ev.tipo;
    if (!tiposValidos.includes(tipo)) {
      tipo = "abierto";
    }
    const esMasivo = Boolean(ev.esMasivo);
    const creadoPorId = ev.creadoPorId || 1;
    const creadoPorNombre = ev.creadoPorNombre || "Administrador";
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
    const almacenados = leerAlmacenamiento("itm_eventos", []);
    return normalizarEventos(almacenados);
  });
  const [inscripciones, setInscripciones] = useState(() =>
    leerAlmacenamiento("itm_inscripciones", [])
  );
  const [cargando, setCargando] = useState(true);

  const cargarEventos = async () => {
    try {
      const token = obtenerToken();
      const datos = token
        ? await listarEventosApi()
        : await listarEventosPublicadosApi();
      if (Array.isArray(datos)) {
        setEventos(normalizarEventos(datos));
      }
    } catch (error) {
      console.error("Error al cargar eventos de la base de datos:", error);
    } finally {
      setCargando(false);
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
      // Endpoint protegido
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
    } catch (error) {
      throw error;
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
    } catch (error) {
      throw error;
    }
  };

  const eliminarEvento = async (id) => {
    try {
      await eliminarEventoApi(id);
      setEventos((prev) => prev.filter((evento) => evento.id !== id));
    } catch (error) {
      throw error;
    }
  };

  const publicarEvento = async (id) => {
    try {
      await publicarEventoApi(id);
      setEventos((prev) =>
        prev.map((evento) =>
          evento.id === id ? { ...evento, estado: "publicado" } : evento
        )
      );
    } catch (error) {
      throw error;
    }
  };

  const cancelarEvento = async (id, motivo = "clima") => {
    try {
      await cancelarEventoApi(id, motivo);
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
    } catch (error) {
      throw error;
    }
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
      return {
        exito: false,
        error: error?.mensaje || error?.message || "Error al registrar la inscripción.",
      };
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
    cargando,
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
