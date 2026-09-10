export function formatearFecha(fechaString) {
  if (!fechaString) return "";
  const fecha = new Date(`${fechaString}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaString;
  return fecha.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatearFechaCorta(fechaString) {
  if (!fechaString) return "";
  const fecha = new Date(`${fechaString}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return fechaString;
  return fecha.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatearHora(horaString) {
  if (!horaString) return "";
  const [hora, minutos] = horaString.split(":").map(Number);
  if (Number.isNaN(hora)) return horaString;
  const periodo = hora >= 12 ? "p.m." : "a.m.";
  let horas = hora % 12;
  if (horas === 0) horas = 12;
  const mins = Number.isNaN(minutos)
    ? ""
    : `:${minutos.toString().padStart(2, "0")}`;
  return `${horas}${mins} ${periodo}`;
}