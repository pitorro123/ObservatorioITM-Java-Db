import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import estilos from "./BuscadorSelect.module.css";

/**
 * Combobox con buscador. El propio campo permite escribir para filtrar.
 * opciones: [{ valor, etiqueta }]
 * valor / onCambio(evento.teclado): control del valor seleccionado
 * placeholder: texto cuando no hay selección
 */
export default function BuscadorSelect({
  opciones,
  valor,
  onCambio,
  placeholder = "Selecciona...",
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const contenedorRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;

    const manejarClicFuera = (evento) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, [abierto]);

  const seleccionada = opciones.find((o) => String(o.valor) === String(valor));

  const opcionesFiltradas = opciones.filter((opcion) =>
    opcion.etiqueta.toLowerCase().includes(busqueda.toLowerCase())
  );

  const seleccionar = (valorOpcion) => {
    onCambio(valorOpcion);
    setAbierto(false);
    setBusqueda("");
  };

  const manejarCambio = (evento) => {
    setAbierto(true);
    setBusqueda(evento.target.value);
  };

  return (
    <div className={estilos.wrap} ref={contenedorRef}>
      <div className={estilos.campo}>
        <input
          type="text"
          className={estilos.input}
          placeholder={placeholder}
          value={abierto ? busqueda : seleccionada?.etiqueta || ""}
          onChange={manejarCambio}
          onFocus={() => setAbierto(true)}
          onKeyDown={(evento) => {
            if (evento.key === "Escape") setAbierto(false);
          }}
        />
        <ChevronDown
          className={`${estilos.chevron} ${abierto ? estilos.chevronAbierto : ""}`}
          aria-hidden="true"
        />
      </div>

      {abierto && (
        <div className={estilos.menu}>
          <div className={estilos.lista}>
            {opcionesFiltradas.length === 0 ? (
              <p className={estilos.vacio}>No se encontraron resultados.</p>
            ) : (
              opcionesFiltradas.map((opcion) => {
                const activo = String(opcion.valor) === String(valor);
                return (
                  <button
                    key={opcion.valor}
                    type="button"
                    className={`${estilos.opcion} ${
                      activo ? estilos.opcionActiva : ""
                    }`}
                    onClick={() => seleccionar(opcion.valor)}
                  >
                    {opcion.etiqueta}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}