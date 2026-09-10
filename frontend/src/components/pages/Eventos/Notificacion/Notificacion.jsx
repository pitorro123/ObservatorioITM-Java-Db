import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import estilos from "./Notificacion.module.css";

export default function Notificacion({ mensaje, onCerrar }) {
  useEffect(() => {
    if (!mensaje) return;
    const tiempo = setTimeout(onCerrar, 3500);
    return () => clearTimeout(tiempo);
  }, [mensaje, onCerrar]);

  if (!mensaje) return null;

  return (
    <div className={estilos.toast} role="status" aria-live="polite">
      <CheckCircle2 className={estilos.icono} aria-hidden="true" />
      <span className={estilos.texto}>{mensaje}</span>
    </div>
  );
}