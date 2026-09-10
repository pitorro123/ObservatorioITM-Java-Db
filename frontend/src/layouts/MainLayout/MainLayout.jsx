import { Outlet } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar/Sidebar.jsx";
import estilos from "./MainLayout.module.css";

export default function MainLayout() {
  return (
    <div className={estilos.contenedor}>
      <Sidebar />
      <div className={estilos.areaContenido}>
        <Outlet />
      </div>
    </div>
  );
}
