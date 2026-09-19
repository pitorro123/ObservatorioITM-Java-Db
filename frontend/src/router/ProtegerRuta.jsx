import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtegerRuta({ rol, children }) {
  const { estaAutenticado, usuarioActual, cargandoAuth } = useAuth();
  const ubicacion = useLocation();

  if (cargandoAuth) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "var(--color-fondo-general, #f8fafc)",
          color: "var(--color-texto-secundario, #64748b)",
          fontSize: "0.95rem",
        }}
      >
        <p>Cargando sesión del Observatorio ITM...</p>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />;
  }

  if (rol && usuarioActual?.rol !== rol) {
    return <Navigate to="/" replace />;
  }

  return children;
}