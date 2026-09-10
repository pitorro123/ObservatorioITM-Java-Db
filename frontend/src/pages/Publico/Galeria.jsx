import { useState } from "react";
import { imagenesGaleria } from "../../data/galeria.js";
import GalleryLightbox from "../../components/publico/GalleryLightbox/GalleryLightbox.jsx";
import styles from "./Galeria.module.css";

export default function Galeria() {
  const [indiceActiva, setIndiceActiva] = useState(null);

  return (
    <section className={styles.raiz}>
      <h1 className={styles.title}>Galería</h1>
      <p className={styles.subtitle}>
        Un recorrido visual por el observatorio, el cielo nocturno y nuestras
        actividades de observación.
      </p>

      <div className={styles.grid}>
        {imagenesGaleria.map((imagen, i) => (
          <button
            key={imagen.id}
            type="button"
            className={styles.gridBtn}
            onClick={() => setIndiceActiva(i)}
            aria-label={`Ampliar ${imagen.titulo}`}
          >
            <img
              src={imagen.ruta}
              alt={imagen.titulo}
              className={styles.gridImg}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <GalleryLightbox
        imagenes={imagenesGaleria}
        indiceActiva={indiceActiva}
        onCerrar={() => setIndiceActiva(null)}
        onCambiarIndice={setIndiceActiva}
      />
    </section>
  );
}