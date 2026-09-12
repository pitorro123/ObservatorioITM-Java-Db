import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import estilos from "./ConfirmacionModal.module.css";

export default function ConfirmacionModal({
  abierto,
  titulo,
  mensaje,
  advertencia,
  onCerrar,
  onConfirmar,
  etiquetaConfirmar = "Confirmar",
  variante = "peligro",
}) {
  if (!abierto) return null;

  const esExito = variante === "exito";

  return (
    <div className={estilos.overlay} role="dialog" aria-modal="true">
      <div className={estilos.modal}>
        <div className={`${estilos.iconoWrap} ${esExito ? estilos.iconoWrapExito : ""}`}>
          {esExito ? (
            <CheckCircle2 className={`${estilos.icono} ${estilos.iconoExito}`} aria-hidden="true" />
          ) : (
            <AlertTriangle className={estilos.icono} aria-hidden="true" />
          )}
        </div>

        <h2 className={estilos.titulo}>{titulo}</h2>
        <p className={estilos.mensaje}>{mensaje}</p>

        {advertencia && (
          <div className={estilos.advertenciaCaja} role="alert">
            <p className={estilos.advertenciaTexto}>{advertencia}</p>
          </div>
        )}

        <div className={estilos.acciones}>
          <button type="button" className={estilos.botonCancelar} onClick={onCerrar}>
            Cancelar
          </button>
          <button
            type="button"
            className={`${estilos.botonConfirmar} ${esExito ? estilos.botonConfirmarExito : ""}`}
            onClick={onConfirmar}
          >
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