import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Navbar from "../../components/layout/Navbar/Navbar.jsx";
import estilos from "./CambiarPassword.module.css";

export default function CambiarPassword() {
  const [parametros] = useSearchParams();
  const token = parametros.get("token");
  const { establecerPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [completado, setCompletado] = useState(false);
  const navegar = useNavigate();

  const manejarEnvio = (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Tu nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const resultado = establecerPassword(token, password);
    if (!resultado.exito) {
      setError(resultado.error);
      return;
    }

    setCompletado(true);
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
          <img src={logo} alt="Logo del Observatorio Astronómico ITM" className={estilos.logo} />

          {completado ? (
            <div className={estilos.exito} role="status">
              <CheckCircle2 className={estilos.iconoExito} aria-hidden="true" />
              <h1 className={estilos.titulo}>¡Contraseña configurada!</h1>
              <p className={estilos.texto}>
                Tu cuenta ahora está activa. Ya puedes iniciar sesión en el panel.
              </p>
              <button
                type="button"
                className={estilos.boton}
                onClick={() => navegar("/login", { replace: true })}
              >
                Ir a iniciar sesión
              </button>
            </div>
          ) : (
            <>
              <h1 className={estilos.titulo}>Configura tu contraseña</h1>
              <p className={estilos.subtitulo}>
                Usa el enlace recibido en tu correo para establecer la contraseña de tu
                cuenta de docente.
              </p>

              {!token && (
                <div className={estilos.error} role="alert">
                  <AlertCircle className={estilos.iconoError} aria-hidden="true" />
                  <p>El enlace es inválido. Pide a la administración un enlace nuevo.</p>
                </div>
              )}

              {token && (
                <form className={estilos.formulario} onSubmit={manejarEnvio} noValidate>
                  {error && (
                    <div className={estilos.error} role="alert">
                      <AlertCircle className={estilos.iconoError} aria-hidden="true" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className={estilos.campo}>
                    <label className={estilos.etiqueta} htmlFor="password">
                      Nueva contraseña
                    </label>
                    <div className={estilos.contraWrapper}>
                      <input
                        id="password"
                        type={verPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={estilos.input}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        className={estilos.botonVer}
                        onClick={() => setVerPassword((prev) => !prev)}
                        aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {verPassword ? (
                          <EyeOff className={estilos.iconoOjo} aria-hidden="true" />
                        ) : (
                          <Eye className={estilos.iconoOjo} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={estilos.campo}>
                    <label className={estilos.etiqueta} htmlFor="confirmar">
                      Confirmar contraseña
                    </label>
                    <input
                      id="confirmar"
                      type={verPassword ? "text" : "password"}
                      required
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      className={estilos.input}
                      placeholder="Repite tu contraseña"
                    />
                  </div>

                  <button type="submit" className={estilos.boton}>
                    <KeyRound className={estilos.iconoBoton} aria-hidden="true" />
                    Guardar contraseña
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}