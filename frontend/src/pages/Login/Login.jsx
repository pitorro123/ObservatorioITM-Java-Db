import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, AlertCircle, ArrowLeft, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Navbar from "../../components/layout/Navbar/Navbar.jsx";
import estilos from "./Login.module.css";

export default function Login() {
  const { login, estaAutenticado } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const navegar = useNavigate();
  const ubicacion = useLocation();

  if (estaAutenticado) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const manejarEnvio = (e) => {
    e.preventDefault();
    const resultado = login(correo, password);
    if (resultado.exito) {
      const destino = ubicacion.state?.desde || "/admin/dashboard";
      navegar(destino, { replace: true });
    } else {
      setError(resultado.error);
    }
  };

  return (
    <div className={estilos.pagina}>
      <Navbar simple />
      <main className={estilos.raiz}>
        <Link to="/" className={estilos.volver}>
          <ArrowLeft className={estilos.iconoVolver} aria-hidden="true" />
          Volver al portal
        </Link>

        <div className={estilos.tarjeta}>
          <div className={estilos.cabecera}>
            <h1 className={estilos.titulo}>Iniciar sesión</h1>
            <p className={estilos.subtitulo}>
              Accede al panel de administración del Observatorio Astronómico del ITM.
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
            <label className={estilos.etiqueta} htmlFor="correo">
              Correo electrónico
            </label>
            <input
              id="correo"
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={estilos.input}
              placeholder="tucorreo@itm.edu.co"
              autoComplete="username"
            />
          </div>

          <div className={estilos.campo}>
            <label className={estilos.etiqueta} htmlFor="password">
              Contraseña
            </label>
            <div className={estilos.contraWrapper}>
              <input
                id="password"
                type={verPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={estilos.input}
                placeholder="Tu contraseña"
                autoComplete="current-password"
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

          <button type="submit" className={estilos.botonIngresar}>
            <LogIn className={estilos.iconoIngresar} aria-hidden="true" />
            Ingresar
          </button>

          <Link to="/recuperar-password" className={estilos.olvido}>
            ¿Olvidaste tu contraseña?
          </Link>
        </form>

        <div className={estilos.aviso}>
          <Info className={estilos.iconoInfo} aria-hidden="true" />
          <div>
            <p className={estilos.avisoTitulo}>Cuentas de demostración</p>
            <p className={estilos.avisoTexto}>
              Administrador: <strong>admin@itm.edu.co</strong> ·{" "}
              <strong>admin123</strong>
            </p>
            <p className={estilos.avisoTexto}>
              Docente: <strong>juan.camilo@itm.edu.co</strong> ·{" "}
              <strong>docente123</strong>
            </p>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}