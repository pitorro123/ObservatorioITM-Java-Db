import { useState } from "react";
import { Search, Calendar, ChevronDown, Check } from "lucide-react";
import estilos from "./BarraFiltros.module.css";

const pestañas = [
  { clave: "publicado", etiqueta: "Publicado" },
  { clave: "borrador", etiqueta: "Borradores" },
  { clave: "cancelado", etiqueta: "Cancelado" },
];

function generarMeses() {
  const ahora = new Date();
  const lista = [];
  for (let delta = -1; delta <= 6; delta++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() + delta, 1);
    const valor = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    const etiqueta = fecha.toLocaleDateString("es-CO", {
      month: "long",
      year: "numeric",
    });
    lista.push({
      valor,
      etiqueta: etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1),
    });
  }
  return lista;
}

function formatearMes(valor) {
  if (!valor) return "Este Mes";
  const [año, mes] = valor.split("-").map(Number);
  const fecha = new Date(año, mes - 1, 1);
  const etiqueta = fecha.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  return etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1);
}

/**
 * conteos: { publicado: number, borradores: number, cancelado: number }
 * pestañaActiva / onCambiarPestaña: control del filtro seleccionado
 * valorBusqueda / onCambiarBusqueda: control del input de búsqueda
 * filtroMes (YYYY-MM | null) / onCambiarFiltroMes: filtro por mes
 */
export default function BarraFiltros({
  conteos,
  pestañaActiva,
  onCambiarPestaña,
  valorBusqueda,
  onCambiarBusqueda,
  filtroMes,
  onCambiarFiltroMes,
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const meses = generarMeses();

  const seleccionarMes = (valor) => {
    onCambiarFiltroMes(valor);
    setMenuAbierto(false);
  };

  return (
    <div className={estilos.barra}>
      <div
        className={estilos.grupoPestañas}
        role="tablist"
        aria-label="Estado del evento"
      >
        {pestañas.map((pestaña) => {
          const activa = pestañaActiva === pestaña.clave;
          return (
            <button
              key={pestaña.clave}
              type="button"
              role="tab"
              aria-selected={activa}
              className={
                activa ? `${estilos.pildora} ${estilos.pildoraActiva}` : estilos.pildora
              }
              onClick={() => onCambiarPestaña(pestaña.clave)}
            >
              {pestaña.etiqueta}
              <span className={estilos.contador}>({conteos[pestaña.clave]})</span>
            </button>
          );
        })}
      </div>

      <div className={estilos.grupoAcciones}>
        <div className={estilos.campoBusqueda}>
          <input
            type="search"
            placeholder="Buscar evento"
            value={valorBusqueda}
            onChange={(evento) => onCambiarBusqueda(evento.target.value)}
            aria-label="Buscar evento"
            className={estilos.input}
          />
          <Search className={estilos.iconoBusqueda} aria-hidden="true" />
        </div>

        <div className={estilos.selectorFechaWrap}>
          <button
            type="button"
            className={`${estilos.selectorFecha} ${
              filtroMes ? estilos.selectorFechaActiva : ""
            }`}
            onClick={() => setMenuAbierto((prev) => !prev)}
            aria-expanded={menuAbierto}
          >
            <Calendar className={estilos.iconoSelector} aria-hidden="true" />
            <span>{formatearMes(filtroMes)}</span>
            <ChevronDown
              className={`${estilos.iconoChevron} ${
                menuAbierto ? estilos.chevronAbierto : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {menuAbierto && (
            <>
              <div
                className={estilos.cierre}
                onClick={() => setMenuAbierto(false)}
              />
              <div className={estilos.menuMeses} role="menu">
                <button
                  type="button"
                  className={`${estilos.menuOpcion} ${
                    !filtroMes ? estilos.menuOpcionActiva : ""
                  }`}
                  onClick={() => seleccionarMes(null)}
                >
                  <span>Todos los meses</span>
                  {!filtroMes && (
                    <Check className={estilos.menuCheck} aria-hidden="true" />
                  )}
                </button>
                {meses.map((mes) => {
                  const activo = filtroMes === mes.valor;
                  return (
                    <button
                      key={mes.valor}
                      type="button"
                      className={`${estilos.menuOpcion} ${
                        activo ? estilos.menuOpcionActiva : ""
                      }`}
                      onClick={() => seleccionarMes(mes.valor)}
                    >
                      <span>{mes.etiqueta}</span>
                      {activo && (
                        <Check className={estilos.menuCheck} aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}