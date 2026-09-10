import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CloudRain,
  CloudSun,
  Droplets,
  Loader2,
  MapPin,
  RefreshCcw,
  Sparkles,
  Thermometer,
  CloudSunRain,
} from "lucide-react";
import { useClima } from "../../../hooks/useClima.js";
import estilos from "./Clima.module.css";

function formatearDia(fechaISO) {
  return new Date(`${fechaISO}T00:00:00`).toLocaleDateString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function Clima() {
  const { estado, cargando, error, consultar } = useClima();

  return (
    <section className={estilos.raiz}>
      <div className={estilos.contenedor}>
        <Link to="/" className={estilos.volver}>
          <ArrowLeft className={estilos.iconoVolver} aria-hidden="true" />
          Volver al inicio
        </Link>

        <div className={estilos.encabezado}>
          <h1 className={estilos.titulo}>Condiciones climáticas</h1>
          <p className={estilos.subtitulo}>
            Consulta el estado del observatorio y las condiciones actuales y pronosticadas
            para los próximos días en la Sede Fraternidad, Medellín.
          </p>
        </div>

        {cargando && (
          <div className={estilos.cargando} role="status">
            <Loader2 className={estilos.girando} aria-hidden="true" />
            <p>Consultando datos meteorológicos en tiempo real…</p>
          </div>
        )}

        {error && !cargando && (
          <div className={estilos.error} role="alert">
            <p className={estilos.errorTitulo}>No fue posible consultar el clima</p>
            <p className={estilos.errorTexto}>{error}</p>
            <button type="button" className={estilos.botonReintentar} onClick={consultar}>
              <RefreshCcw className={estilos.iconoBoton} aria-hidden="true" />
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && (
          <>
            <div className={estilos.gridActual}>
              <article className={`${estilos.tarjeta} ${estilos.tarjetaPrincipal}`}>
                <span className={estilos.badge}>Ahora en Medellín</span>
                <div className={estilos.temperaturaPrincipal}>
                  <Thermometer className={estilos.iconoTemperatura} aria-hidden="true" />
                  {Math.round(estado.temperatura)}°C
                </div>
                <p className={estilos.descripcionClima}>{estado.descripcion}</p>
                <p className={estilos.rango}>
                  Máx {Math.round(estado.maxHoy)}° · Mín {Math.round(estado.minHoy)}°
                </p>
                <p className={estilos.ubicacion}>
                  <MapPin className={estilos.iconoInline} aria-hidden="true" />
                  Sede Fraternidad · Medellín, Colombia
                </p>
              </article>

              <article className={estilos.tarjeta}>
                <CloudSun className={estilos.iconoTarjeta} aria-hidden="true" />
                <h2 className={estilos.tituloTarjeta}>Nubosidad</h2>
                <p className={estilos.valorTarjeta}>{Math.round(estado.nubosidad)}%</p>
                <p className={estilos.textoTarjeta}>
                  {estado.grupo}
                </p>
              </article>

              <article className={estilos.tarjeta}>
                <CloudRain className={estilos.iconoTarjeta} aria-hidden="true" />
                <h2 className={estilos.tituloTarjeta}>Probabilidad de lluvia</h2>
                <p className={estilos.valorTarjeta}>
                  {Number.isFinite(estado.probabilidadLluviaHoy)
                    ? `${estado.probabilidadLluviaHoy}%`
                    : "—"}
                </p>
                <p className={estilos.textoTarjeta}>Para hoy</p>
              </article>

              <article className={estilos.tarjeta}>
                <Droplets className={estilos.iconoTarjeta} aria-hidden="true" />
                <h2 className={estilos.tituloTarjeta}>Humedad relativa</h2>
                <p className={estilos.valorTarjeta}>{Math.round(estado.humedad)}%</p>
                <p className={estilos.textoTarjeta}>Humedad del aire actual</p>
              </article>
            </div>

            <article className={estilos.tarjetaRecomendacion}>
              <div className={estilos.recomendacionHeader}>
                <Sparkles className={estilos.iconoRecomendacion} aria-hidden="true" />
                <div>
                  <h2 className={estilos.tituloRecomendacion}>
                    ¿Se puede observar hoy?
                  </h2>
                  <p className={estilos.valorRecomendacion}>
                    {estado.observatorio.estadoValor}
                  </p>
                </div>
              </div>
              <p className={estilos.textoRecomendacion}>
                {estado.observatorio.recomendacion}
              </p>
            </article>

            <div className={estilos.seccionPronostico}>
              <h2 className={estilos.tituloPronostico}>Pronóstico de los próximos días</h2>
              <div className={estilos.gridPronostico}>
                {estado.pronostico.slice(0, 7).map((dia) => (
                  <article key={dia.fecha} className={estilos.tarjetaDia}>
                    <p className={estilos.diaNombre}>{formatearDia(dia.fecha)}</p>
                    <CloudSunRain className={estilos.iconoDia} aria-hidden="true" />
                    <p className={estilos.diaTemp}>
                      {Math.round(dia.max)}° / {Math.round(dia.min)}°
                    </p>
                    <p className={estilos.diaLluvia}>
                      <CloudRain className={estilos.iconoInline} aria-hidden="true" />
                      {dia.probabilidadLluvia != null ? `${dia.probabilidadLluvia}%` : "—"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}