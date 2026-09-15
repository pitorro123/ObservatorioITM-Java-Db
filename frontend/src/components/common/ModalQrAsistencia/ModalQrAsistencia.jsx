import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
} from "lucide-react";
import estilos from "./ModalQrAsistencia.module.css";

export default function ModalQrAsistencia({ abierto, onCerrar, evento }) {
  const [copiado, setCopiado] = useState(false);
  const [modoProyeccion, setModoProyeccion] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    if (!abierto) {
      setModoProyeccion(false);
      setCopiado(false);
      return;
    }
    const manejarTecla = (e) => {
      if (e.key === "Escape") {
        if (modoProyeccion) {
          setModoProyeccion(false);
        } else {
          onCerrar();
        }
      }
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [abierto, modoProyeccion, onCerrar]);

  if (!abierto || !evento) return null;

  // URL a la que dirigirá el QR al escanear
  const origen = typeof window !== "undefined" ? window.location.origin : "https://observatorio-itm-java-db-p1bi.vercel.app";
  const urlAsistencia = `${origen}/eventos/${evento.id}?modo=asistencia`;

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlAsistencia);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback
    }
  };

  const descargarQrPng = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Tamaño amplio para alta resolución al descargar / proyectar
    const size = 600;
    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      // Fondo blanco detrás del código QR
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const pngFile = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const tituloLimpio = (evento.titulo || "evento")
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "_")
        .substring(0, 25);
      link.download = `QR_Asistencia_${tituloLimpio}_${evento.id}.png`;
      link.href = pngFile;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const imprimirQr = () => {
    window.print();
  };

  return (
    <div
      className={estilos.overlay}
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (modoProyeccion) setModoProyeccion(false);
        else onCerrar();
      }}
    >
      <div
        className={`${estilos.modal} ${modoProyeccion ? estilos.modalProyeccion : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={estilos.botonCerrar}
          onClick={() => {
            if (modoProyeccion) setModoProyeccion(false);
            else onCerrar();
          }}
          aria-label="Cerrar modal"
        >
          <X className={estilos.iconoCerrar} aria-hidden="true" />
        </button>

        <span className={estilos.badge}>
          <QrCode size={14} aria-hidden="true" />
          Registro de Asistencia en Sitio
        </span>

        <h2 className={estilos.titulo}>
          {modoProyeccion ? "Escanea el Código QR para Asistencia" : "Código QR del Evento Masivo"}
        </h2>

        <p className={estilos.nombreEvento}>
          <strong>{evento.titulo}</strong>
        </p>

        <div className={estilos.contenedorQr} ref={qrRef}>
          <QRCodeSVG
            value={urlAsistencia}
            size={modoProyeccion ? 340 : 230}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className={estilos.instruccion}>
          Los estudiantes y asistentes deben escanear este código QR con la cámara de su celular
          en el auditorio para ingresar sus datos y validar su asistencia inmediatamente.
        </p>

        <div className={estilos.barraUrl}>
          <span className={estilos.urlTexto} title={urlAsistencia}>
            {urlAsistencia}
          </span>
          <button
            type="button"
            className={estilos.botonCopiarMini}
            onClick={copiarEnlace}
            title="Copiar enlace directo"
          >
            {copiado ? (
              <>
                <Check size={14} color="#16a34a" /> Copiado
              </>
            ) : (
              <>
                <Copy size={14} /> Copiar
              </>
            )}
          </button>
        </div>

        <div className={estilos.acciones}>
          <button
            type="button"
            className={`${estilos.botonAccion} ${estilos.botonProyectar}`}
            onClick={() => setModoProyeccion(!modoProyeccion)}
          >
            {modoProyeccion ? (
              <>
                <Minimize2 size={16} /> Salir de proyección
              </>
            ) : (
              <>
                <Maximize2 size={16} /> Pantalla completa / Proyectar
              </>
            )}
          </button>

          <button
            type="button"
            className={`${estilos.botonAccion} ${estilos.botonPrimario}`}
            onClick={descargarQrPng}
          >
            <Download size={16} /> Descargar PNG
          </button>

          <button
            type="button"
            className={`${estilos.botonAccion} ${estilos.botonSecundario}`}
            onClick={imprimirQr}
          >
            <Printer size={16} /> Imprimir cartel
          </button>
        </div>
      </div>
    </div>
  );
}

