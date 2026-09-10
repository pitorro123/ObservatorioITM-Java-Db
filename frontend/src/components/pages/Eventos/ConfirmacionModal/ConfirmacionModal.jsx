import { AlertTriangle, X } from "lucide-react";
import estilos from "./ConfirmacionModal.module.css";

export default function ConfirmacionModal({ abierto, titulo, mensaje, onCerrar, onConfirmar, etiquetaConfirmar = "Confirmar" }) {
  if (!abierto) return null;

  return (
    <div className={estilos.overlay} role="dialog" aria-modal="true">
      <div className={estilos.modal}>
        <div className={estilos.iconoWrap}>
          <AlertTriangle className={estilos.icono} aria-hidden="true" />
        </div>

        <h2 className={estilos.titulo}>{titulo}</h2>
        <p className={estilos.mensaje}>{mensaje}</p>

        <div className={estilos.acciones}>
          <button type="button" className={estilos.botonCancelar} onClick={onCerrar}>
            Cancelar
          </button>
          <button type="button" className={estilos.botonConfirmar} onClick={onConfirmar}>
            {etiquetaConfirmar}
          </button>
        </div>

        <button
          type="button"
          className={estilos.botonCerrar}
          onClick={onCerrar}
          aria-label="Cerrar"
        >
          <X className={estilos.iconoCerrar} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}