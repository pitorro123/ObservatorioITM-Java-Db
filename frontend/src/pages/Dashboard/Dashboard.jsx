import { CalendarDays, CalendarCheck, Users, UserCheck } from "lucide-react";
import Header from "../../components/layout/Header/Header.jsx";
import { useEventosContext } from "../../context/EventosContext.jsx";
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