import { createContext, useContext, useEffect, useState } from "react";
import { contenidoSemillero, contenidoObservatorio } from "../data/observatorio.js";
import {
  leerAlmacenamiento,
  escribirAlmacenamiento,
} from "../utils/almacenamiento.js";

const ContenidoContext = createContext(null);

export function ContenidoProvider({ children }) {
  const [semillero, setSemillero] = useState(() =>
    leerAlmacenamiento("itm_semillero", contenidoSemillero)
  );
  const [observatorio, setObservatorio] = useState(() =>
    leerAlmacenamiento("itm_observatorio", contenidoObservatorio)
  );

  useEffect(() => {
    escribirAlmacenamiento("itm_semillero", semillero);
  }, [semillero]);

  useEffect(() => {
    escribirAlmacenamiento("itm_observatorio", observatorio);
  }, [observatorio]);

  const guardarSemillero = ({ titulo, descripcion, objetivos, comoParticipar }) => {
    setSemillero({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      objetivos: objetivos
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean),
      comoParticipar: comoParticipar.trim(),
    });
    return { exito: true };
  };

  const guardarObservatorio = ({ titulo, descripcion, trayectoria, mision, vision }) => {
    setObservatorio({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      trayectoria: trayectoria
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean),
      mision: mision.trim(),
      vision: vision.trim(),
    });
    return { exito: true };
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