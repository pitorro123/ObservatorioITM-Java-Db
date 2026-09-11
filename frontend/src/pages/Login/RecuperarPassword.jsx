import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MailCheck, AlertCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Navbar from "../../components/layout/Navbar/Navbar.jsx";
import estilos from "./RecuperarPassword.module.css";

export default function RecuperarPassword() {
  const { solicitarRecuperacion } = useAuth();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(null);
  const navegar = useNavigate();

  const manejarEnvio = (e) => {
    e.preventDefault();
    setError("");

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    const resultado = solicitarRecuperacion(correo);
    if (!resultado.exito) {
      setError(resultado.error);
      return;
    }

    setEnviado(resultado);
  };

  return (
    <div className={estilos.pagina}>
      <Navbar simple />
      <main className={estilos.raiz}>
        <Link to="/login" className={estilos.volver}>
          <ArrowLeft className={estilos.iconoVolver} aria-hidden="true" />
          Volver a iniciar sesión
        </Link>

        <div className={estilos.tarjeta}>
          {enviado ? (
            <div className={estilos.exito} role="status">
              <MailCheck className={estilos.iconoExito} aria-hidden="true" />
              <h1 className={estilos.titulo}>Revisa tu correo</h1>
              <p className={estilos.subtitulo}>
                Si existe una cuenta con <strong>{correo.trim()}</strong>, te enviamos un
                mensaje con las instrucciones para restablecer tu contraseña.
              </p>

              <div className={estilos.demo}>
                <p className={estilos.demoTitulo}>
                  Modo demostración (sin envío real de correo)
                </p>
                <p className={estilos.demoTexto}>
                  En esta demo el enlace se muestra aquí para que puedas continuar:
                </p>
                <a
                  href={enviado.enlace}
                  className={estilos.demoEnlace}
                  onClick={(evento) => {
                    evento.preventDefault();
                    navegar(enviado.enlace.replace(window.location.origin, ""));
                  }}
                >
                  <ExternalLink className={estilos.iconoDemo} aria-hidden="true" />
                  Abrir enlace de recuperación
                </a>
              </div>

              <button
                type="button"
                className={estilos.boton}
                onClick={() => navegar("/login", { replace: true })}
              >
                Volver a iniciar sesión
              </button>
            </div>
          ) : (
            <>
              <div className={estilos.cabecera}>
                <h1 className={estilos.titulo}>Recuperar contraseña</h1>
                <p className={estilos.subtitulo}>
                  Ingresa tu correo y te enviaremos un mensaje con las instrucciones
                  para restablecer tu contraseña.
                </p>
              </div>

              <form className={estilos.formulario} onSubmit={manejarEnvio} noValidate>
                {error && (
                  <div className={estilos.alerta} role="alert">
                    <AlertCircle className={estilos.iconoAlerta} aria-hidden="true" />
                    {error}
                  </div>
                )}

                <div className={estilos.campo}>
                  <label className={estilos.etiqueta} htmlFor="correo-recuperacion">
                    Correo electrónico
                  </label>
                  <input
                    id="correo-recuperacion"
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className={estilos.input}
                    placeholder="tucorreo@itm.edu.co"
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className={estilos.boton}>
                  <Mail className={estilos.iconoBoton} aria-hidden="true" />
                  Enviar enlace
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}