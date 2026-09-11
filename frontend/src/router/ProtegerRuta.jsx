import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtegerRuta({ rol, children }) {
  const { estaAutenticado, usuarioActual } = useAuth();
  const ubicacion = useLocation();

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />;
  }

  if (rol && usuarioActual.rol !== rol) {
    return <Navigate to="/" replace />;
  }

  return children;
}