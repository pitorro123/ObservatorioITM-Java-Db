import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtegerRuta({ rol, children }) {
  const { estaAutenticado, usuarioActual, restaurando } = useAuth();
  const ubicacion = useLocation();

  if (restaurando) return null;

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />;
  }

  if (rol && usuarioActual.rol !== rol) {
    return <Navigate to="/" replace />;
  }

  return children;
}