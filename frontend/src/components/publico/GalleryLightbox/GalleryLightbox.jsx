import { useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import estilos from "./GalleryLightbox.module.css";

export default function GalleryLightbox({
  imagenes,
  indiceActiva,
  onCerrar,
  onCambiarIndice,
}) {
  useEffect(() => {
    if (indiceActiva === null || indiceActiva === undefined) return;

    const total = imagenes.length;
    const manejarTeclado = (evento) => {
      if (evento.key === "Escape") onCerrar();
      if (evento.key === "ArrowRight") {
        onCambiarIndice((indiceActiva + 1) % total);
      }
      if (evento.key === "ArrowLeft") {
        onCambiarIndice((indiceActiva - 1 + total) % total);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", manejarTeclado);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", manejarTeclado);
    };
  }, [indiceActiva, imagenes.length, onCerrar, onCambiarIndice]);

  if (indiceActiva === null || indiceActiva === undefined) return null;

  const total = imagenes.length;
  const imagen = imagenes[indiceActiva];
  const anterior = () => onCambiarIndice((indiceActiva - 1 + total) % total);
  const siguiente = () => onCambiarIndice((indiceActiva + 1) % total);

  return (
    <div
      className={estilos.overlay}
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de galería"
    >
      <div
        className={estilos.lightbox}
        onClick={(evento) => evento.stopPropagation()}
      >
        <button
          type="button"
          className={estilos.cerrar}
          onClick={onCerrar}
          aria-label="Cerrar visor"
        >
          <X className={estilos.botonIcono} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={estilos.flecha}
          onClick={anterior}
          aria-label="Imagen anterior"
        >
          <ChevronLeft className={estilos.botonIcono} aria-hidden="true" />
        </button>

        <figure className={estilos.figura}>
          <img
            src={imagen.ruta}
            alt={imagen.titulo}
            className={estilos.imagen}
          />
          <figcaption className={estilos.caption}>
            <strong>{imagen.titulo}</strong>
            <span>{imagen.descripcion}</span>
          </figcaption>
        </figure>

        <button
          type="button"
          className={estilos.flecha}
          onClick={siguiente}
          aria-label="Imagen siguiente"
        >
          <ChevronRight className={estilos.botonIcono} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}