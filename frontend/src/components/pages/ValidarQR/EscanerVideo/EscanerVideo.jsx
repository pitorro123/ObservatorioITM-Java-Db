import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { CameraOff, XCircle, RefreshCw } from "lucide-react";
import estilos from "./EscanerVideo.module.css";

const ID_ESCANER = "visor-lector-qr";

export default function EscanerVideo({ onDetect, onCerrar }) {
  const escanerRef = useRef(null);
  const [error, setError] = useState("");

  const detener = async () => {
    const escaner = escanerRef.current;
    escanerRef.current = null;
    if (escaner) {
      try {
        await escaner.stop();
        escaner.clear();
      } catch {
        // la cámara ya fue liberada o nunca inició
      }
    }
  };

  const iniciar = async () => {
    setError("");
    try {
      await detener();
      const escaner = new Html5Qrcode(ID_ESCANER, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      escanerRef.current = escaner;

      await escaner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (texto) => {
          onDetect(texto);
        },
        () => {}
      );
    } catch (err) {
      if (escanerRef.current) {
        try {
          escanerRef.current.clear();
        } catch {
          // sin estado que limpiar
        }
        escanerRef.current = null;
      }
      if (err && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
        setError("Permiso de cámara denegado. Habilita el acceso a la cámara en el navegador e inténtalo de nuevo.");
      } else if (err && (err.name === "NotFoundError" || err.name === "OverconstrainedError")) {
        setError("No se encontró una cámara disponible. Verifica que el dispositivo tenga cámara.");
      } else if (err && err.name === "NotReadableError") {
        setError("La cámara ya está en uso por otra aplicación. Ciérrala e inténtalo de nuevo.");
      } else {
        setError("No fue posible iniciar la cámara. Inténtalo de nuevo.");
      }
    }
  };

  useEffect(() => {
    iniciar();
    return () => {
      detener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={estilos.escaner}>
      <div className={estilos.visor} id={ID_ESCANER} />

      {error && (
        <div className={estilos.error} role="alert">
          <XCircle className={estilos.iconoError} aria-hidden="true" />
          <p className={estilos.textoError}>{error}</p>
          <button type="button" className={estilos.botonReintentar} onClick={iniciar}>
            <RefreshCw className={estilos.iconoReintentar} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      )}

      <div className={estilos.pie}>
        <p className={estilos.ayuda}>
          <CameraOff className={estilos.iconoAyuda} aria-hidden="true" />
          Apunta el código QR del participante hacia la cámara.
        </p>
        <button type="button" className={estilos.botonCerrar} onClick={onCerrar}>
          Cancelar
        </button>
      </div>
    </div>
  );
}