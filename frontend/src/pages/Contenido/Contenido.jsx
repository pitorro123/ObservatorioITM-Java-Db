import { useState } from "react";
import { Save, Rocket, GraduationCap, Building2, Info } from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import Notificacion from "../../components/pages/Eventos/Notificacion/Notificacion.jsx";
import { useContenido } from "../../context/ContenidoContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import estilos from "./Contenido.module.css";

function SeccionSemillero({ onNotificar }) {
  const { semillero, guardarSemillero } = useContenido();
  const [formulario, setFormulario] = useState({
    titulo: semillero.titulo,
    descripcion: semillero.descripcion,
    objetivos: semillero.objetivos.join("\n"),
    comoParticipar: semillero.comoParticipar,
  });

  const manejarCambio = (campo) => (e) => {
    setFormulario((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const manejarGuardar = (e) => {
    e.preventDefault();
    guardarSemillero(formulario);
    onNotificar("Información del semillero actualizada correctamente.");
  };

  return (
    <form className={estilos.tarjeta} onSubmit={manejarGuardar}>
      <div className={estilos.encabezadoTarjeta}>
        <span className={estilos.iconoTarjeta}>
          <GraduationCap className={estilos.icono} aria-hidden="true" />
        </span>
        <div>
          <h2 className={estilos.tituloTarjeta}>Semillero de astronomía</h2>
          <p className={estilos.subtituloTarjeta}>
            Información mostrada en la página pública del semillero.
          </p>
        </div>
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Título</label>
        <input
          type="text"
          value={formulario.titulo}
          onChange={manejarCambio("titulo")}
          className={estilos.input}
        />
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Descripción</label>
        <textarea
          rows={3}
          value={formulario.descripcion}
          onChange={manejarCambio("descripcion")}
          className={estilos.textarea}
        />
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Objetivos (uno por línea)</label>
        <textarea
          rows={6}
          value={formulario.objetivos}
          onChange={manejarCambio("objetivos")}
          className={estilos.textarea}
        />
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Cómo participar</label>
        <textarea
          rows={4}
          value={formulario.comoParticipar}
          onChange={manejarCambio("comoParticipar")}
          className={estilos.textarea}
        />
      </div>

      <button type="submit" className={estilos.botonGuardar}>
        <Save className={estilos.iconoBoton} aria-hidden="true" />
        Guardar semillero
      </button>
    </form>
  );
}

function SeccionObservatorio({ onNotificar }) {
  const { observatorio, guardarObservatorio } = useContenido();
  const [formulario, setFormulario] = useState({
    titulo: observatorio.titulo,
    descripcion: observatorio.descripcion,
    trayectoria: observatorio.trayectoria.join("\n"),
    mision: observatorio.mision,
    vision: observatorio.vision,
  });

  const manejarCambio = (campo) => (e) => {
    setFormulario((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  const manejarGuardar = (e) => {
    e.preventDefault();
    guardarObservatorio(formulario);
    onNotificar("Información del observatorio actualizada correctamente.");
  };

  return (
    <form className={estilos.tarjeta} onSubmit={manejarGuardar}>
      <div className={estilos.encabezadoTarjeta}>
        <span className={estilos.iconoTarjeta}>
          <Building2 className={estilos.icono} aria-hidden="true" />
        </span>
        <div>
          <h2 className={estilos.tituloTarjeta}>Sobre el Observatorio</h2>
          <p className={estilos.subtituloTarjeta}>
            Información mostrada en la página "Sobre nosotros".
          </p>
        </div>
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Título</label>
        <input
          type="text"
          value={formulario.titulo}
          onChange={manejarCambio("titulo")}
          className={estilos.input}
        />
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Descripción</label>
        <textarea
          rows={3}
          value={formulario.descripcion}
          onChange={manejarCambio("descripcion")}
          className={estilos.textarea}
        />
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Trayectoria (uno por línea)</label>
        <textarea
          rows={5}
          value={formulario.trayectoria}
          onChange={manejarCambio("trayectoria")}
          className={estilos.textarea}
        />
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Misión</label>
        <textarea
          rows={4}
          value={formulario.mision}
          onChange={manejarCambio("mision")}
          className={estilos.textarea}
        />
      </div>

      <div className={estilos.campo}>
        <label className={estilos.etiqueta}>Visión</label>
        <textarea
          rows={4}
          value={formulario.vision}
          onChange={manejarCambio("vision")}
          className={estilos.textarea}
        />
      </div>

      <button type="submit" className={estilos.botonGuardar}>
        <Save className={estilos.iconoBoton} aria-hidden="true" />
        Guardar observatorio
      </button>
    </form>
  );
}

export default function Contenido() {
  const { esAdmin } = useAuth();
  const [notificacion, setNotificacion] = useState("");

  return (
    <div className={estilos.pagina}>
      <div className={estilos.seccionSuperior}>
        <Header
          rutaBreadcrumb={["Dashboard", "Contenido"]}
          titulo="Gestión de contenido"
        />
      </div>

      <div className={estilos.contenedor}>
        {esAdmin && (
          <div className={estilos.aviso}>
            <Info className={estilos.iconoAviso} aria-hidden="true" />
            <p>
              Como administrador puedes editar la información general del observatorio y del
              semillero. Los cambios se reflejan de inmediato en el portal público.
            </p>
          </div>
        )}

        <div className={estilos.grid}>
          <SeccionSemillero onNotificar={setNotificacion} />
          {esAdmin && <SeccionObservatorio onNotificar={setNotificacion} />}
        </div>

        {!esAdmin && (
          <div className={estilos.aviso}>
            <Rocket className={estilos.iconoAviso} aria-hidden="true" />
            <p>
              Edita aquí la información del semillero. La información general del observatorio
              es gestionada por el administrador.
            </p>
          </div>
        )}
      </div>

      <Notificacion mensaje={notificacion} onCerrar={() => setNotificacion("")} />
    </div>
  );
}