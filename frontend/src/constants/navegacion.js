export const RUTAS = {
  DASHBOARD: "/admin/dashboard",
  EVENTOS: "/admin/eventos",
  ASISTENCIA: "/admin/asistencia",
  VALIDAR_QR: "/admin/validar-qr",
  DOCENTES: "/admin/docentes",
  CONTENIDO: "/admin/contenido",
  FEEDBACK: "/admin/feedback",
};

export const ENLACES_NAVEGACION = [
  { etiqueta: "Dashboard", ruta: RUTAS.DASHBOARD, icono: "LayoutGrid", roles: ["Administrador", "Docente"] },
  { etiqueta: "Eventos", ruta: RUTAS.EVENTOS, icono: "CalendarDays", roles: ["Administrador", "Docente"] },
  { etiqueta: "Asistencia", ruta: RUTAS.ASISTENCIA, icono: "ClipboardCheck", roles: ["Administrador", "Docente"] },
  { etiqueta: "Validar QR", ruta: RUTAS.VALIDAR_QR, icono: "QrCode", roles: ["Administrador", "Docente"] },
  { etiqueta: "Docentes", ruta: RUTAS.DOCENTES, icono: "GraduationCap", roles: ["Administrador"] },
  { etiqueta: "Contenido", ruta: RUTAS.CONTENIDO, icono: "FileEdit", roles: ["Administrador", "Docente"] },
  { etiqueta: "Feedback", ruta: RUTAS.FEEDBACK, icono: "Grid3x3", roles: ["Administrador", "Docente"] },
];