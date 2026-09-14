import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MailCheck, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Navbar from "../../components/layout/Navbar/Navbar.jsx";
import estilos from "./RecuperarPassword.module.css";

export default function RecuperarPassword() {
  const { solicitarRecuperacion } = useAuth();
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const navegar = useNavigate();

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (cargando) return;
    setError("");

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(correo.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setCargando(true);
    try {
      const resultado = await solicitarRecuperacion(correo.trim());
      if (!resultado.exito) {
        setError(resultado.error);
        return;
      }
      setEnviado(true);
    } catch (err) {
      setError(err?.mensaje || err?.message || "No se pudo procesar la solicitud de recuperación.");
    } finally {
      setCargando(false);
    }
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
                Si existe una cuenta asociada a <strong>{correo.trim()}</strong>, hemos enviado
                un mensaje con las instrucciones y el enlace para restablecer tu contraseña.
              </p>

              <div className={estilos.cajaAviso}>
                <CheckCircle2 className={estilos.iconoAviso} aria-hidden="true" />
                <div className={estilos.textoAviso}>
                  <p className={estilos.avisoTitulo}>Correo enviado</p>
                  <p className={estilos.avisoDetalle}>
                    Revisa tu bandeja de entrada o la carpeta de spam. Haz clic en el enlace recibido en tu correo para restablecer tu contraseña.
                  </p>
                </div>
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

                <button type="submit" className={estilos.boton} disabled={cargando}>
                  <Mail className={estilos.iconoBoton} aria-hidden="true" />
                  {cargando ? "Enviando enlace..." : "Enviar enlace"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}