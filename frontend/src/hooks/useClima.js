import { useEffect, useState, useCallback } from "react";

const LAT = 6.2422;
const LON = -75.5494;

const URL_CONSULTA =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,relative_humidity_2m,cloud_cover,precipitation,weather_code` +
  `&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code` +
  `&timezone=America%2FBogota&forecast_days=7`;

const CODIGOS_CLIMA = {
  0: { descripcion: "Cielo despejado", grupo: "Noche despejada" },
  1: { descripcion: "Mayormente despejado", grupo: "Noche despejada" },
  2: { descripcion: "Parcialmente nublado", grupo: "Nube parcial" },
  3: { descripcion: "Cielo cubierto", grupo: "Cielo nublado" },
  45: { descripcion: "Niebla", grupo: "Cielo nublado" },
  48: { descripcion: "Niebla con escarcha", grupo: "Cielo nublado" },
  51: { descripcion: "Llovizna ligera", grupo: "Riesgo de lluvia" },
  53: { descripcion: "Llovizna moderada", grupo: "Riesgo de lluvia" },
  55: { descripcion: "Llovizna intensa", grupo: "Riesgo de lluvia" },
  61: { descripcion: "Lluvia ligera", grupo: "Riesgo de lluvia" },
  63: { descripcion: "Lluvia moderada", grupo: "Riesgo de lluvia" },
  65: { descripcion: "Lluvia intensa", grupo: "Riesgo de lluvia" },
  80: { descripcion: "Chubascos ligeros", grupo: "Riesgo de lluvia" },
  81: { descripcion: "Chubascos moderados", grupo: "Riesgo de lluvia" },
  82: { descripcion: "Chubascos violentos", grupo: "Riesgo de lluvia" },
  95: { descripcion: "Tormenta eléctrica", grupo: "Riesgo de lluvia" },
  96: { descripcion: "Tormenta con granizo ligero", grupo: "Riesgo de lluvia" },
  99: { descripcion: "Tormenta con granizo fuerte", grupo: "Riesgo de lluvia" },
};

function calcularCondiciones(clima) {
  const nubosidad = clima?.current?.cloud_cover ?? 0;
  const probabilidadLluvia = clima?.daily?.precipitation_probability_max?.[0] ?? 0;
  const lluvia = clima?.current?.precipitation ?? 0;

  if (nubosidad < 25 && probabilidadLluvia < 30 && lluvia === 0) {
    return {
      valor: "FAVORABLES",
      descripcion: "Las condiciones actuales son adecuadas para observar el cielo.",
      recomendacion:
        "Excelente noche para observar. Lleva ropa abrigada y revisa el horario del evento.",
    };
  }

  if (nubosidad < 60 && probabilidadLluvia < 60) {
    return {
      valor: "PARCIALES",
      descripcion:
        "Hay nubosidad parcial; las observaciones podrían verse interrumpidas.",
      recomendacion:
        "Sigue las actividades, pero el cielo podría cerrarse en cualquier momento.",
    };
  }

  return {
    valor: "DESFAVORABLES",
    descripcion:
      "El cielo está nublado o con alta probabilidad de lluvia para observar.",
    recomendacion:
      "Puedes asistir a charlas y talleres, pero la observación telescópica no estará disponible.",
  };
}

export function useClima() {
  const [clima, setClima] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const consultar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await fetch(URL_CONSULTA);
      if (!respuesta.ok) {
        throw new Error("No fue posible consultar el clima.");
      }
      const datos = await respuesta.json();
      setClima(datos);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    consultar();
  }, [consultar]);

  const codigo = clima?.current?.weather_code;
  const condiciones = calcularCondiciones(clima);

  const estado = {
    codigo,
    descripcion: codigo != null ? (CODIGOS_CLIMA[codigo]?.descripcion ?? "No disponible") : null,
    grupo: codigo != null ? (CODIGOS_CLIMA[codigo]?.grupo ?? "No disponible") : null,
    temperatura: clima?.current?.temperature_2m,
    humedad: clima?.current?.relative_humidity_2m,
    nubosidad: clima?.current?.cloud_cover,
    lluvia: clima?.current?.precipitation,
    maxHoy: clima?.daily?.temperature_2m_max?.[0],
    minHoy: clima?.daily?.temperature_2m_min?.[0],
    probabilidadLluviaHoy: clima?.daily?.precipitation_probability_max?.[0],
    pronostico: (clima?.daily?.time ?? []).map((fecha, i) => ({
      fecha,
      max: clima.daily.temperature_2m_max[i],
      min: clima.daily.temperature_2m_min[i],
      probabilidadLluvia: clima.daily.precipitation_probability_max[i],
      codigo: clima.daily.weather_code?.[i],
    })),
    observatorio: {
      estadoValor: condiciones.valor,
      estadoDescripcion: condiciones.descripcion,
      recomendacion: condiciones.recomendacion,
    },
  };

  return { clima, estado, cargando, error, consultar };
}