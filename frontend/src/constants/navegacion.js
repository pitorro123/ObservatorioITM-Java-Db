export const RUTAS = {
  DASHBOARD: "/admin/dashboard",
  EVENTOS: "/admin/eventos",
  ASISTENCIA: "/admin/asistencia",
  VALIDAR_ASISTENCIA: "/admin/validar-asistencia",
  DOCENTES: "/admin/docentes",
};

export const ENLACES_NAVEGACION = [
  { etiqueta: "Dashboard", ruta: RUTAS.DASHBOARD, icono: "LayoutGrid", roles: ["Administrador", "Docente"] },
  { etiqueta: "Eventos", ruta: RUTAS.EVENTOS, icono: "CalendarDays", roles: ["Administrador", "Docente"] },
  { etiqueta: "Asistencia", ruta: RUTAS.ASISTENCIA, icono: "ClipboardCheck", roles: ["Administrador", "Docente"] },
  { etiqueta: "Validar Asistencia", ruta: RUTAS.VALIDAR_ASISTENCIA, icono: "KeyRound", roles: ["Administrador", "Docente"] },
  { etiqueta: "Docentes", ruta: RUTAS.DOCENTES, icono: "GraduationCap", roles: ["Administrador"] },
];