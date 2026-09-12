import { useEffect } from "react";
import { CloudRain, UserX, X, CalendarX2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import estilos from "./ModalEventoCancelado.module.css";

export default function ModalEventoCancelado({
  abierto,
  onCerrar,
  tituloEvento = "",
  motivo = "clima",
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!abierto) return;
    const manejarTecla = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const irAEventos = () => {
    onCerrar();
    navigate("/eventos");
  };

  const esPersonal = motivo === "personal";

  return (
    <div className={estilos.overlay} role="dialog" aria-modal="true" onClick={onCerrar}>
      <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={estilos.botonCerrar}
          onClick={onCerrar}
          aria-label="Cerrar modal"
        >
          <X className={estilos.iconoCerrar} aria-hidden="true" />
        </button>

        <div className={`${estilos.iconoWrap} ${esPersonal ? estilos.iconoWrapPersonal : ""}`}>
          {esPersonal ? (
            <UserX className={estilos.iconoPersonal} aria-hidden="true" />
          ) : (
            <CloudRain className={estilos.iconoClima} aria-hidden="true" />
          )}
        </div>

        <span className={estilos.badgeCancelado}>Inscripción no disponible</span>

        <h2 className={estilos.titulo}>
          {esPersonal
            ? "Cancelado por el docente por asuntos personales"
            : "Cancelado por el docente por condiciones climáticas"}
        </h2>

        {tituloEvento && (
          <p className={estilos.nombreEvento}>
            Evento: <strong>{tituloEvento}</strong>
          </p>
        )}

        <div className={estilos.cajaExplicativa}>
          <p className={estilos.textoExplicativo}>
            {esPersonal
              ? "El docente a cargo ha cancelado este evento por asuntos personales o motivos de fuerza mayor no previstos, por lo que no se llevará a cabo la sesión programada."
              : "El docente a cargo ha cancelado este evento debido a que las condiciones meteorológicas actuales (nubosidad o lluvia) no son favorables para el desarrollo de la actividad astronómica."}
          </p>
          <p className={estilos.textoAviso}>
            Te invitamos a consultar la programación de nuestros próximos eventos y actividades en el Observatorio ITM.
          </p>
        </div>

        <div className={estilos.acciones}>
          <button
            type="button"
            className={estilos.botonExplorar}
            onClick={irAEventos}
          >
            <CalendarX2 className={estilos.iconoBoton} aria-hidden="true" />
            Ver otros eventos disponibles
          </button>
          <button
            type="button"
            className={estilos.botonCerrarModal}
            onClick={onCerrar}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

