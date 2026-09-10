import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api/servicios.js";

const ContenidoContext = createContext(null);

const semilleroVacio = { titulo: "", descripcion: "", objetivos: [], comoParticipar: "" };
const observatorioVacio = {
  titulo: "",
  descripcion: "",
  trayectoria: [],
  mision: "",
  vision: "",
};

export function ContenidoProvider({ children }) {
  const [semillero, setSemillero] = useState(semilleroVacio);
  const [observatorio, setObservatorio] = useState(observatorioVacio);

  const cargarContenido = async () => {
    try {
      const [s, o] = await Promise.all([api.obtenerSemillero(), api.obtenerObservatorio()]);
      if (s) setSemillero({ ...semilleroVacio, ...s });
      if (o) setObservatorio({ ...observatorioVacio, ...o });
    } catch {
      // el contenido llega cuando el servidor responda
    }
  };

  useEffect(() => {
    cargarContenido();
  }, []);

  const guardarSemillero = async ({ titulo, descripcion, objetivos, comoParticipar }) => {
    try {
      const datos = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        objetivos: objetivos
          .split("\n")
          .map((o) => o.trim())
          .filter(Boolean),
        comoParticipar: comoParticipar.trim(),
      };
      setSemillero(await api.guardarSemillero(datos));
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo guardar el semillero." };
    }
  };

  const guardarObservatorio = async ({
    titulo,
    descripcion,
    trayectoria,
    mision,
    vision,
  }) => {
    try {
      const datos = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        trayectoria: trayectoria
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        mision: mision.trim(),
        vision: vision.trim(),
      };
      setObservatorio(await api.guardarObservatorio(datos));
      return { exito: true };
    } catch (error) {
      return { exito: false, error: error.mensaje || "No se pudo guardar el observatorio." };
    }
  };

  const value = {
    semillero,
    observatorio,
    guardarSemillero,
    guardarObservatorio,
  };

  return <ContenidoContext.Provider value={value}>{children}</ContenidoContext.Provider>;
}

export function useContenido() {
  const context = useContext(ContenidoContext);
  if (!context) {
    throw new Error("useContenido debe usarse dentro de ContenidoProvider");
  }
  return context;
}