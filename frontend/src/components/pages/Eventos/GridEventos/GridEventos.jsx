import TarjetaEvento from "../TarjetaEvento/TarjetaEvento.jsx";
import estilos from "./GridEventos.module.css";

/**
 * eventos: array de eventos a renderizar en la cuadrícula
 */
export default function GridEventos({
  eventos,
  onEditar,
  onEliminar,
  onPublicar,
  onCancelar,
}) {
  if (eventos.length === 0) {
    return <p className={estilos.mensajeVacio}>No se encontraron eventos.</p>;
  }

  return (
    <div className={estilos.cuadricula}>
      {eventos.map((evento) => (
        <TarjetaEvento
          key={evento.id}
          evento={evento}
          onEditar={onEditar}
          onEliminar={onEliminar}
          onPublicar={onPublicar}
          onCancelar={onCancelar}
        />
      ))}
    </div>
  );
}