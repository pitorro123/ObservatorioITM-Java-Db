import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar/Navbar.jsx";
import Footer from "../components/layout/Footer/Footer.jsx";
import estilos from "./PublicLayout.module.css";

export default function PublicLayout() {
  return (
    <div className={estilos.raiz}>
      <Navbar />
      <main className={estilos.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}