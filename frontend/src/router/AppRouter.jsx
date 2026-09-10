import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";
import MainLayout from "../layouts/MainLayout/MainLayout.jsx";
import Inicio from "../pages/Publico/Inicio/Inicio.jsx";
import EventosPublicos from "../pages/Publico/Eventos/Eventos.jsx";
import DetalleEvento from "../pages/Publico/DetalleEvento/DetalleEvento.jsx";
import Semillero from "../pages/Publico/Semillero.jsx";
import Galeria from "../pages/Publico/Galeria.jsx";
import SobreNosotros from "../pages/Publico/SobreNosotros.jsx";
import Clima from "../pages/Publico/Clima/Clima.jsx";
import Login from "../pages/Login/Login.jsx";
import RecuperarPassword from "../pages/Login/RecuperarPassword.jsx";
import CambiarPassword from "../pages/Login/CambiarPassword.jsx";
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Eventos from "../pages/Eventos/Eventos.jsx";
import Asistencia from "../pages/Asistencia/Asistencia.jsx";
import ValidarQR from "../pages/ValidarQR/ValidarQR.jsx";
import Docentes from "../pages/Docentes/Docentes.jsx";
import Perfil from "../pages/Perfil/Perfil.jsx";
import Contenido from "../pages/Contenido/Contenido.jsx";
import Feedback from "../pages/Feedback/Feedback.jsx";
import ProtegerRuta from "./ProtegerRuta.jsx";
import { RUTAS } from "../constants/navegacion.js";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/eventos" element={<EventosPublicos />} />
        <Route path="/eventos/:id" element={<DetalleEvento />} />
        <Route path="/semillero" element={<Semillero />} />
        <Route path="/galeria" element={<Galeria />} />
        <Route path="/sobre-nosotros" element={<SobreNosotros />} />
        <Route path="/clima" element={<Clima />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/cambiar-password" element={<CambiarPassword />} />

      <Route
        path="/admin"
        element={
          <ProtegerRuta>
            <MainLayout />
          </ProtegerRuta>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="asistencia" element={<Asistencia />} />
        <Route path="validar-qr" element={<ValidarQR />} />
        <Route
          path="docentes"
          element={
            <ProtegerRuta rol="Administrador">
              <Docentes />
            </ProtegerRuta>
          }
        />
        <Route path="contenido" element={<Contenido />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="feedback" element={<Feedback />} />
        <Route index element={<Navigate to={RUTAS.DASHBOARD} replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}