import { CalendarDays, CalendarCheck, Users, UserCheck, CloudRain } from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import { useEventosContext } from "../../context/EventosContext.jsx";
import { useClima } from "../../hooks/useClima.js";
import estilos from "./Dashboard.module.css";

const HOY = new Date().toISOString().slice(0, 10);

const etiquetasEstado = {
  publicado: "Activo",
  borrador: "Borrador",
  cancelado: "Cancelado",
};

const tarjetasResumen = [
  { clave: "eventosActivos", etiqueta: "Eventos Activos", icono: CalendarDays },
  { clave: "eventosFinalizados", etiqueta: "Eventos Finalizados", icono: CalendarCheck },
  { clave: "totalInscritos", etiqueta: "Personas Inscritas", icono: Users },
  { clave: "totalAsistentes", etiqueta: "Asistentes", icono: UserCheck },
];

export default function Dashboard() {
  const { eventos, resumenDashboard } = useEventosContext();
  const { estado: estadoClima } = useClima();
  const esDesfavorable = estadoClima?.observatorio?.esDesfavorable;

  const eventosOrdenados = [...eventos].sort((a, b) => a.fecha.localeCompare(b.fecha));

  return (
    <div className={estilos.pagina}>
      <div className={estilos.seccionSuperior}>
        <Header rutaBreadcrumb={["Dashboard"]} titulo="Dashboard" />
        <div className={estilos.bienvenida}>
          <h2 className={estilos.tituloBienvenida}>
            Bienvenido al panel del Observatorio Astronómico ITM
          </h2>
          <p className={estilos.textoBienvenida}>
            Aquí puedes consultar el estado de cada evento y la participación de la
            comunidad.
          </p>
        </div>

        {esDesfavorable && (
          <div className={estilos.bannerAvisoClima} role="alert">
            <CloudRain className={estilos.bannerIcono} aria-hidden="true" />
            <div className={estilos.bannerTexto}>
              <strong>Aviso meteorológico:</strong> Clima no favorable.{" "}
              <strong>Directriz ITM:</strong> no canceles el evento, trasládalo a aula o auditorio bajo techo.
            </div>
          </div>
        )}

        <div className={estilos.grillaResumen}>
          {tarjetasResumen.map((tarjeta) => {
            const Icono = tarjeta.icono;
            return (
              <div key={tarjeta.clave} className={estilos.resumenCard}>
                <span className={estilos.resumenIconoWrap}>
                  <Icono className={estilos.resumenIcono} aria-hidden="true" />
                </span>
                <div>
                  <p className={estilos.resumenValor}>
                    {resumenDashboard[tarjeta.clave] ?? 0}
                  </p>
                  <p className={estilos.resumenEtiqueta}>{tarjeta.etiqueta}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={estilos.contenedorTarjetas}>
        <div className={estilos.tarjetaLista}>
          <h3 className={estilos.tituloLista}>Eventos</h3>
          {eventosOrdenados.length === 0 ? (
            <p className={estilos.sinEventos}>No hay eventos registrados.</p>
          ) : (
            <div className={estilos.tablaWrap}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Docente</th>
                    <th>Estado</th>
                    <th>Inscritos</th>
                    <th>Asistentes</th>
                    <th>Próximo</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosOrdenados.map((evento) => {
                    const proximo =
                      evento.estado === "publicado" && evento.fecha >= HOY;
                    return (
                      <tr key={evento.id}>
                        <td>
                          <p className={estilos.nombreEvento}>{evento.titulo}</p>
                          <p className={estilos.fechaEvento}>{evento.fecha}</p>
                          {evento.esMasivo && (
                            <span className={estilos.badgeMasivoEvento}>Aforo libre</span>
                          )}
                          {esDesfavorable && evento.tipo === "observacion" && evento.estado === "publicado" && (
                            <span className={estilos.badgeClimaEvento}>Modalidad en sala</span>
                          )}
                        </td>
                        <td>
                          <span className={estilos.docenteTexto}>
                            {evento.creadoPorNombre || "Docente ITM"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`${estilos.badge} ${
                              estilos[`badge${etiquetasEstado[evento.estado]}`] ??
                              estilos.badgeActivo
                            }`}
                          >
                            {etiquetasEstado[evento.estado] ?? evento.estado}
                          </span>
                        </td>
                        <td className={estilos.datoCentrado}>{evento.inscritos || 0}</td>
                        <td className={estilos.datoCentrado}>{evento.asistentes || 0}</td>
                        <td>
                          {proximo ? (
                            <span className={estilos.badgeProximo}>Sí</span>
                          ) : (
                            <span className={estilos.textoNo}>No</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}