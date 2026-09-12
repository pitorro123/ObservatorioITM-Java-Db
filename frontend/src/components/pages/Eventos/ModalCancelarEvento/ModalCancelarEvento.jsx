import { useState, useEffect } from "react";
import { AlertTriangle, CloudRain, UserX, X } from "lucide-react";
import estilos from "./ModalCancelarEvento.module.css";

export default function ModalCancelarEvento({
  abierto,
  evento,
  onCerrar,
  onConfirmar,
}) {
  const [motivo, setMotivo] = useState("clima");

  useEffect(() => {
    if (abierto) {
      setMotivo("clima");
    }
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    const manejarTecla = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", manejarTecla);
    return () => window.removeEventListener("keydown", manejarTecla);
  }, [abierto, onCerrar]);

  if (!abierto || !evento) return null;

  const manejarConfirmar = () => {
    onConfirmar(motivo);
  };

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

        <div className={estilos.iconoWrap}>
          <AlertTriangle className={estilos.iconoPeligro} aria-hidden="true" />
        </div>

        <h2 className={estilos.titulo}>¿Cancelar este evento?</h2>
        <p className={estilos.mensaje}>
          Estás a punto de cancelar <strong>"{evento.titulo}"</strong>. Dejará de mostrarse como activo en el portal público.
        </p>

        {/* Selección de motivo */}
        <div className={estilos.seccionMotivo}>
          <p className={estilos.etiquetaMotivo}>
            ¿Por qué motivo deseas cancelar este evento?
          </p>

          <div className={estilos.grillaOpciones}>
            <button
              type="button"
              className={`${estilos.opcionCard} ${
                motivo === "clima" ? estilos.opcionCardActiva : ""
              }`}
              onClick={() => setMotivo("clima")}
            >
              <div className={estilos.opcionHeader}>
                <div className={`${estilos.iconoOpcionWrap} ${estilos.iconoClimaWrap}`}>
                  <CloudRain className={estilos.iconoOpcion} aria-hidden="true" />
                </div>
                <div className={estilos.opcionRadio}>
                  <span
                    className={`${estilos.radioPunto} ${
                      motivo === "clima" ? estilos.radioPuntoActivo : ""
                    }`}
                  />
                </div>
              </div>
              <strong className={estilos.opcionTitulo}>Condiciones climáticas</strong>
              <span className={estilos.opcionSubtitulo}>
                Lluvia, nubosidad densa o mal clima
              </span>
            </button>

            <button
              type="button"
              className={`${estilos.opcionCard} ${
                motivo === "personal" ? estilos.opcionCardActiva : ""
              }`}
              onClick={() => setMotivo("personal")}
            >
              <div className={estilos.opcionHeader}>
                <div className={`${estilos.iconoOpcionWrap} ${estilos.iconoPersonalWrap}`}>
                  <UserX className={estilos.iconoOpcion} aria-hidden="true" />
                </div>
                <div className={estilos.opcionRadio}>
                  <span
                    className={`${estilos.radioPunto} ${
                      motivo === "personal" ? estilos.radioPuntoActivo : ""
                    }`}
                  />
                </div>
              </div>
              <strong className={estilos.opcionTitulo}>Asuntos personales</strong>
              <span className={estilos.opcionSubtitulo}>
                Fuerza mayor, salud o agenda docente
              </span>
            </button>
          </div>
        </div>

        {/* Advertencia dinámica según el motivo */}
        {motivo === "clima" ? (
          <div className={estilos.cajaAdvertenciaClima} role="alert">
            <div className={estilos.cabeceraAdvertencia}>
              <AlertTriangle className={estilos.iconoAdvertencia} aria-hidden="true" />
              <strong>Directriz Institucional del Observatorio ITM</strong>
            </div>
            <p className={estilos.textoAdvertencia}>
              Por directriz institucional, <strong>los eventos no se cancelan por lluvia o mal clima</strong>. Te sugerimos mantener el evento activo y trasladar la jornada a aula o auditorio en modalidad bajo techo con talleres y charlas interactivas.
            </p>
          </div>
        ) : (
          <div className={estilos.cajaAvisoPersonal} role="status">
            <div className={estilos.cabeceraAvisoPersonal}>
              <UserX className={estilos.iconoAvisoPersonal} aria-hidden="true" />
              <strong>Cancelación por Asuntos Personales</strong>
            </div>
            <p className={estilos.textoAvisoPersonal}>
              El evento quedará registrado como cancelado por motivos personales o fuerza mayor del docente a cargo.
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className={estilos.acciones}>
          <button
            type="button"
            className={estilos.botonCancelar}
            onClick={onCerrar}
          >
            Volver
          </button>
          <button
            type="button"
            className={estilos.botonConfirmar}
            onClick={manejarConfirmar}
          >
            Confirmar cancelación
          </button>
        </div>
      </div>
    </div>
  );
}

