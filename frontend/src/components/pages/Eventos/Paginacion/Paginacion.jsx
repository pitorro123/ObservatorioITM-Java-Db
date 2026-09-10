import { ChevronLeft, ChevronRight } from "lucide-react";
import estilos from "./Paginacion.module.css";

/**
 * paginaActual: número de página seleccionada
 * totalPaginas: número total de páginas
 * onCambiarPagina: callback(nuevaPagina)
 */
export default function Paginacion({ paginaActual, totalPaginas, onCambiarPagina }) {
  const paginas = Array.from({ length: totalPaginas }, (_, indice) => indice + 1);

  return (
    <nav className={estilos.paginacion} aria-label="Paginación de eventos">
      <button
        type="button"
        className={estilos.botonFlecha}
        onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
        disabled={paginaActual === 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className={estilos.icono} aria-hidden="true" />
      </button>

      {paginas.map((pagina) => (
        <button
          key={pagina}
          type="button"
          className={
            pagina === paginaActual
              ? `${estilos.numero} ${estilos.numeroActivo}`
              : estilos.numero
          }
          onClick={() => onCambiarPagina(pagina)}
          aria-current={pagina === paginaActual ? "page" : undefined}
        >
          {pagina}
        </button>
      ))}

      <button
        type="button"
        className={estilos.botonFlecha}
        onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
        disabled={paginaActual === totalPaginas}
        aria-label="Página siguiente"
      >
        <ChevronRight className={estilos.icono} aria-hidden="true" />
      </button>
    </nav>
  );
}
