import { useState } from "react";
import { UserPlus, Pencil, X, AlertCircle, Check } from "lucide-react";
import estilos from "./FormularioDocente.module.css";

const opcionesEdicion = [
  {
    clave: "nombre",
    etiqueta: "Nombre completo",
    descripcion: "Cambiar el nombre del docente",
  },
  {
    clave: "correo",
    etiqueta: "Correo electrónico",
    descripcion: "Cambiar el correo del docente",
  },
  {
    clave: "estado",
    etiqueta: "Estado de la cuenta",
    descripcion: "Activar o desactivar la cuenta",
  },
];

export default function FormularioDocente({
  abierto,
  docente,
  onCerrar,
  onGuardar,
}) {
  const [datos, setDatos] = useState(() => ({
    nombre: docente?.nombre || "",
    correo: docente?.correo || "",
    estado: docente?.estado || "Activo",
  }));
  const [camposEdicion, setCamposEdicion] = useState([]);
  const [error, setError] = useState("");

  if (!abierto) return null;

  const esEdicion = Boolean(docente);

  const manejarCambio = (campo) => (evento) => {
    setDatos((prev) => ({ ...prev, [campo]: evento.target.value }));
    if (error) setError("");
  };

  const alternarCampo = (clave) => {
    setCamposEdicion((prev) =>
      prev.includes(clave) ? prev.filter((c) => c !== clave) : [...prev, clave]
    );
    if (error) setError("");
  };

  const manejarEnvio = (e) => {
    e.preventDefault();

    if (esEdicion) {
      if (camposEdicion.length === 0) {
        setError("Selecciona al menos un campo para editar.");
        return;
      }

      const cambios = {};

      if (camposEdicion.includes("nombre")) {
        const nombre = datos.nombre.trim();
        if (nombre.length < 3) {
          setError("Ingresa el nombre completo del docente.");
          return;
        }
        cambios.nombre = nombre;
      }

      if (camposEdicion.includes("correo")) {
        const correo = datos.correo.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
          setError("Ingresa un correo electrónico válido.");
          return;
        }
        cambios.correo = correo;
      }

      if (camposEdicion.includes("estado")) {
        cambios.estado = datos.estado;
      }

      const resultado = onGuardar(cambios);

      if (resultado && !resultado.exito) {
        setError(resultado.error);
        return;
      }

      setDatos({
        nombre: docente.nombre,
        correo: docente.correo,
        estado: docente.estado,
      });
      setCamposEdicion([]);
      setError("");
      return;
    }

    const nombre = datos.nombre.trim();
    const correo = datos.correo.trim();

    if (nombre.length < 3) {
      setError("Ingresa el nombre completo del docente.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    const resultado = onGuardar({
      nombre,
      correo,
      estado: "Pendiente",
    });

    if (resultado && !resultado.exito) {
      setError(resultado.error);
      return;
    }

    setDatos({ nombre: "", correo: "", estado: "Activo" });
    setCamposEdicion([]);
    setError("");
  };

  return (
    <div className={estilos.overlay} role="dialog" aria-modal="true">
      <div className={estilos.modal}>
        <div className={estilos.cabecera}>
          <div className={estilos.tituloWrap}>
            <span className={estilos.iconoWrap}>
              {esEdicion ? (
                <Pencil className={estilos.icono} aria-hidden="true" />
              ) : (
                <UserPlus className={estilos.icono} aria-hidden="true" />
              )}
            </span>
            <div>
              <h2 className={estilos.titulo}>
                {esEdicion ? "Editar cuenta de docente" : "Crear cuenta de docente"}
              </h2>
              <p className={estilos.subtitulo}>
                {esEdicion
                  ? "Selecciona qué datos deseas actualizar."
                  : "La cuenta recibirá un enlace por correo para configurar su contraseña."}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={estilos.botonCerrar}
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X className={estilos.iconoCerrar} aria-hidden="true" />
          </button>
        </div>

        <form className={estilos.formulario} onSubmit={manejarEnvio} noValidate>
          {error && (
            <div className={estilos.alertError} role="alert">
              <AlertCircle className={estilos.iconoError} aria-hidden="true" />
              {error}
            </div>
          )}

          {esEdicion ? (
            <>
              <div className={estilos.resumenCuenta}>
                <div className={estilos.filaResumen}>
                  <span className={estilos.etiquetaResumen}>
                    Nombre completo
                  </span>
                  <span className={estilos.valorResumen}>{docente.nombre}</span>
                </div>
                <div className={estilos.filaResumen}>
                  <span className={estilos.etiquetaResumen}>
                    Correo electrónico
                  </span>
                  <span className={estilos.valorResumen}>{docente.correo}</span>
                </div>
                <div className={estilos.filaResumen}>
                  <span className={estilos.etiquetaResumen}>
                    Estado de la cuenta
                  </span>
                  <span className={estilos.valorResumen}>{docente.estado}</span>
                </div>
              </div>

              <p className={estilos.pregunta}>¿Qué deseas editar?</p>

              <div className={estilos.opciones}>
                {opcionesEdicion.map((opcion) => {
                  const activa = camposEdicion.includes(opcion.clave);
                  return (
                    <button
                      key={opcion.clave}
                      type="button"
                      className={`${estilos.opcion} ${
                        activa ? estilos.opcionActiva : ""
                      }`}
                      onClick={() => alternarCampo(opcion.clave)}
                      aria-pressed={activa}
                    >
                      <span
                        className={`${estilos.checkWrap} ${
                          activa ? estilos.checkWrapActivo : ""
                        }`}
                      >
                        {activa && (
                          <Check className={estilos.check} aria-hidden="true" />
                        )}
                      </span>
                      <span className={estilos.opcionTexto}>
                        <span className={estilos.opcionEtiqueta}>
                          {opcion.etiqueta}
                        </span>
                        <span className={estilos.opcionDescripcion}>
                          {opcion.descripcion}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {camposEdicion.length > 0 && (
                <div className={estilos.camposEditar}>
                  {camposEdicion.includes("nombre") && (
                    <div className={estilos.campo}>
                      <label
                        className={estilos.etiqueta}
                        htmlFor="docente-nombre"
                      >
                        Nuevo nombre completo
                      </label>
                      <input
                        id="docente-nombre"
                        type="text"
                        required
                        value={datos.nombre}
                        onChange={manejarCambio("nombre")}
                        className={estilos.input}
                        placeholder="Ej. María Fernanda Ospina"
                      />
                    </div>
                  )}

                  {camposEdicion.includes("correo") && (
                    <div className={estilos.campo}>
                      <label
                        className={estilos.etiqueta}
                        htmlFor="docente-correo"
                      >
                        Nuevo correo electrónico
                      </label>
                      <input
                        id="docente-correo"
                        type="email"
                        required
                        value={datos.correo}
                        onChange={manejarCambio("correo")}
                        className={estilos.input}
                        placeholder="nombre@itm.edu.co"
                      />
                    </div>
                  )}

                  {camposEdicion.includes("estado") && (
                    <div className={estilos.campo}>
                      <label
                        className={estilos.etiqueta}
                        htmlFor="docente-estado"
                      >
                        Estado de la cuenta
                      </label>
                      <select
                        id="docente-estado"
                        value={datos.estado}
                        onChange={manejarCambio("estado")}
                        className={estilos.input}
                      >
                        <option value="Activo">Activo</option>
                        <option value="Desactivado">Desactivado</option>
                        <option value="Pendiente">Pendiente</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className={estilos.campo}>
                <label className={estilos.etiqueta} htmlFor="docente-nombre">
                  Nombre completo
                </label>
                <input
                  id="docente-nombre"
                  type="text"
                  required
                  value={datos.nombre}
                  onChange={manejarCambio("nombre")}
                  className={estilos.input}
                  placeholder="Ej. María Fernanda Ospina"
                />
              </div>

              <div className={estilos.campo}>
                <label className={estilos.etiqueta} htmlFor="docente-correo">
                  Correo electrónico
                </label>
                <input
                  id="docente-correo"
                  type="email"
                  required
                  value={datos.correo}
                  onChange={manejarCambio("correo")}
                  className={estilos.input}
                  placeholder="nombre@itm.edu.co"
                />
              </div>
            </>
          )}

          <div className={estilos.acciones}>
            <button
              type="button"
              className={estilos.botonCancelar}
              onClick={onCerrar}
            >
              Cancelar
            </button>
            <button type="submit" className={estilos.botonGuardar}>
              {esEdicion ? "Guardar cambios" : "Crear cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}