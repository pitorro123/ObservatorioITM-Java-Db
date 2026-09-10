import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { imagenesGaleria } from "../../../../data/galeria.js";
import SectionTitle from "../../../common/SectionTitle/SectionTitle.jsx";
import GalleryLightbox from "../../GalleryLightbox/GalleryLightbox.jsx";
import styles from "./Gallery.module.css";

export default function Gallery() {
  const scrollRef = useRef(null);
  const [indiceActiva, setIndiceActiva] = useState(null);

  const scrollByAmount = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = container.clientWidth * 0.8 * direction;
    container.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className={styles.raiz}>
      <div className={styles.inner}>
        <SectionTitle
          rightSlot={
            <Link to="/galeria" className={styles.link}>
              Ver más fotos
              <ArrowRight className={styles.linkIcon} aria-hidden="true" />
            </Link>
          }
        >
          Galería
        </SectionTitle>

        <div className={styles.carouselWrap}>
          <div ref={scrollRef} className={styles.carousel}>
            {imagenesGaleria.map((imagen, i) => (
              <button
                key={imagen.id}
                type="button"
                className={styles.carouselBtn}
                onClick={() => setIndiceActiva(i)}
                aria-label={`Ampliar ${imagen.titulo}`}
              >
                <img
                  src={imagen.ruta}
                  alt={imagen.titulo}
                  className={styles.carouselImg}
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Ver fotos anteriores"
            className={`${styles.navBtn} ${styles.navPrev}`}
          >
            <ChevronLeft className={styles.navIcon} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Ver más fotos"
            className={`${styles.navBtn} ${styles.navNext}`}
          >
            <ChevronRight className={styles.navIcon} aria-hidden="true" />
          </button>
        </div>
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
