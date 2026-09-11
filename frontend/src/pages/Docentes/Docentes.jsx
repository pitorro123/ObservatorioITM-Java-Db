import { useState, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Mail,
  Copy,
  Check,
  GraduationCap,
} from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import FormularioDocente from "../../components/pages/Docentes/FormularioDocente/FormularioDocente.jsx";
import ConfirmacionModal from "../../components/pages/Eventos/ConfirmacionModal/ConfirmacionModal.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import estilos from "./Docentes.module.css";

function CorreoEnviadoModal({ abierto, enlace, docente, onCerrar }) {
  const [copiado, setCopiado] = useState(false);

  if (!abierto) return null;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <div className={estilos.overlay} role="dialog" aria-modal="true">
      <div className={estilos.modalCorreo}>
        <span className={estilos.iconoCorreoWrap}>
          <Mail className={estilos.iconoCorreo} aria-hidden="true" />
        </span>
        <h2 className={estilos.tituloCorreo}>Correo de activación enviado</h2>
        <p className={estilos.textoCorreo}>
          Se envió una invitación a <strong>{docente?.correo}</strong> para configurar la
          contraseña de la cuenta de {docente?.nombre}.
        </p>

        <p className={estilos.textoCorreo}>
          Contraseña temporal:{" "}
          <code className={estilos.codigo}>{docente?.passwordTemporal}</code>
        </p>

        <div className={estilos.enlaceWrap}>
          <span className={estilos.enlaceLabel}>Enlace de activación</span>
          <div className={estilos.enlaceFila}>
            <code className={estilos.enlaceCodigo} title={enlace}>
              {enlace}
            </code>
            <button
              type="button"
              className={estilos.botonCopiar}
              onClick={copiar}
              aria-label="Copiar enlace"
            >
              {copiado ? (
                <Check className={estilos.iconoBoton} aria-hidden="true" />
              ) : (
                <Copy className={estilos.iconoBoton} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button type="button" className={estilos.botonEntendido} onClick={onCerrar}>
          Entendido
        </button>
      </div>
    </div>
  );
}

const insigniasEstado = {
  Activo: { clase: estilos.insigniaActivo },
  Pendiente: { clase: estilos.insigniaPendiente },
  Desactivado: { clase: estilos.insigniaDesactivado },
};

export default function Docentes() {
  const { docentes, crearDocente, editarDocente, eliminarDocente } = useAuth();

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [docenteEditando, setDocenteEditando] = useState(null);
  const [docenteEliminar, setDocenteEliminar] = useState(null);
  const [correoEnviado, setCorreoEnviado] = useState(null);
  const [notificacion, setNotificacion] = useState("");

  const [tooltipOculto, setTooltipOculto] = useState(false);
  const temporizadorTooltip = useRef(null);

  const mostrarTooltip = () => {
    clearTimeout(temporizadorTooltip.current);
    setTooltipOculto(false);
    temporizadorTooltip.current = setTimeout(() => setTooltipOculto(true), 2000);
  };

  const ocultarTooltip = () => {
    clearTimeout(temporizadorTooltip.current);
    setTooltipOculto(false);
  };

  const abrirCrear = () => {
    setDocenteEditando(null);
    setFormularioAbierto(true);
  };

  const abrirEditar = (docente) => {
    setDocenteEditando(docente);
    setFormularioAbierto(true);
  };

  const manejarGuardar = (datos) => {
    if (docenteEditando) {
      const resultado = editarDocente(docenteEditando.id, datos);
      if (!resultado.exito) return resultado;
      setNotificacion("Cuenta de docente actualizada correctamente.");
    } else {
      const resultado = crearDocente(datos);
      if (!resultado.exito) return resultado;
      setNotificacion("Cuenta de docente creada correctamente.");
      setCorreoEnviado(resultado);
    }
    setFormularioAbierto(false);
    setDocenteEditando(null);
    return { exito: true };
  };

  const manejarEliminar = () => {
    if (docenteEliminar) {
      eliminarDocente(docenteEliminar.id);
      setNotificacion("Cuenta de docente eliminada correctamente.");
    }
    setDocenteEliminar(null);
  };

  return (
    <div className={estilos.pagina}>
      <div className={estilos.seccionSuperior}>
        <Header rutaBreadcrumb={["Dashboard", "Docentes"]} titulo="Cuentas de docentes" />
        <p className={estilos.descripcion}>
          Crea, edita y elimina las cuentas de acceso de los docentes encargados de la gestión
          del observatorio y el semillero.
        </p>
      </div>

      <div className={estilos.contenedorLista}>
        {docentes.length === 0 ? (
          <div className={estilos.vacio}>
            <GraduationCap className={estilos.iconoVacio} aria-hidden="true" />
            <p>No hay cuentas de docentes registradas.</p>
          </div>
        ) : (
          <ul className={estilos.lista}>
            {docentes.map((docente) => (
              <li key={docente.id} className={estilos.fila}>
                <span className={estilos.avatarDocente}>
                  <GraduationCap className={estilos.iconoAvatar} aria-hidden="true" />
                </span>

                <div className={estilos.datosDocente}>
                  <p className={estilos.nombreDocente}>{docente.nombre}</p>
                  <p className={estilos.correoDocente}>{docente.correo}</p>
                </div>

                <span
                  className={`${estilos.insignia} ${
                    insigniasEstado[docente.estado]?.clase || estilos.insigniaActivo
                  }`}
                >
                  {docente.estado}
                </span>

                <div className={estilos.acciones}>
                  <button
                    type="button"
                    className={estilos.botonAccion}
                    onClick={() => abrirEditar(docente)}
                    aria-label={`Editar a ${docente.nombre}`}
                    title="Editar cuenta"
                  >
                    <Pencil className={estilos.iconoAccion} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`${estilos.botonAccion} ${estilos.botonEliminar}`}
                    onClick={() => setDocenteEliminar(docente)}
                    aria-label={`Eliminar a ${docente.nombre}`}
                    title="Eliminar cuenta"
                  >
                    <Trash2 className={estilos.iconoAccion} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        className={estilos.botonFlotante}
        aria-label="Crear cuenta de docente"
        onClick={abrirCrear}
        onMouseEnter={mostrarTooltip}
        onMouseLeave={ocultarTooltip}
        onFocus={mostrarTooltip}
        onBlur={ocultarTooltip}
      >
        <Plus className={estilos.iconoPlus} aria-hidden="true" />
        <span
          className={`${estilos.tooltip} ${tooltipOculto ? estilos.tooltipOculto : ""}`}
        >
          Agregar un nuevo docente
        </span>
      </button>

      <FormularioDocente
        key={docenteEditando?.id || "nuevo"}
        abierto={formularioAbierto}
        docente={docenteEditando}
        onCerrar={() => {
          setFormularioAbierto(false);
          setDocenteEditando(null);
        }}
        onGuardar={manejarGuardar}
      />

      <CorreoEnviadoModal
        abierto={Boolean(correoEnviado)}
        enlace={correoEnviado?.enlace}
        docente={correoEnviado?.docente}
        onCerrar={() => setCorreoEnviado(null)}
      />

      <ConfirmacionModal
        abierto={Boolean(docenteEliminar)}
        titulo="¿Eliminar esta cuenta de docente?"
        mensaje={
          docenteEliminar
            ? `Se eliminará la cuenta de ${docenteEliminar.nombre}. El docente perderá el acceso al panel de forma permanente.`
            : ""
        }
        onCerrar={() => setDocenteEliminar(null)}
        onConfirmar={manejarEliminar}
        etiquetaConfirmar="Eliminar"
      />

      <Notificacion mensaje={notificacion} onCerrar={() => setNotificacion("")} />
    </div>
  );
}