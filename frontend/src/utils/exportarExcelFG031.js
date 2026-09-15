import * as XLSX from "xlsx";

/**
 * Genera y descarga el formato oficial institucional ITM:
 * FG 031 - LISTADO DE ASISTENCIA - VISITAS ESTRATÉGICAS, DE RELACIONAMIENTO O EVENTOS ITM
 * Versión: 03 | Fecha de vigencia: 15-04-2024
 *
 * Sin columna de firma física (asistencia validada digitalmente en el Observatorio ITM).
 *
 * @param {Object} evento - Datos del evento (titulo, docente, fecha, hora, lugar, etc.)
 * @param {Array} asistentes - Lista de inscripciones / asistentes
 */
export function exportarExcelFG031(evento = {}, asistentes = []) {
  const nombreActividad = (evento.titulo || "Evento Observatorio ITM").toUpperCase();
  const facilitador =
    evento.docenteNombre ||
    evento.docente ||
    evento.creadoPor ||
    "Equipo Observatorio ITM";
  const fechaEvento = evento.fecha || new Date().toISOString().split("T")[0];
  const horario = evento.hora
    ? `${evento.hora}${evento.horaFin ? ` a ${evento.horaFin}` : ""}`
    : "Por definir";
  const lugar = evento.lugar || "Observatorio ITM - Sede Fraternidad";

  // Construcción de filas (AOA: Array of Arrays)
  const rows = [
    // Encabezado institucional
    ["INSTITUCIÓN UNIVERSITARIA ITM", "", "", "", "", ""],
    ["SISTEMA INTEGRADO DE GESTIÓN", "", "", "", "", ""],
    [
      "LISTADO DE ASISTENCIA - VISITAS ESTRATÉGICAS, DE RELACIONAMIENTO O EVENTOS ITM",
      "",
      "",
      "",
      "",
      "",
    ],
    ["CÓDIGO: FG 031", "VERSIÓN: 03", "FECHA: 15-04-2024", "", "", ""],
    [], // Fila en blanco
    // Datos del evento
    ["DATOS DE LA ACTIVIDAD / EVENTO", "", "", "", "", ""],
    ["NOMBRE DE LA ACTIVIDAD:", nombreActividad, "", "", "", ""],
    ["FACILITADOR / RESPONSABLE:", facilitador, "", "FECHA:", fechaEvento, ""],
    ["HORARIO:", horario, "", "LUGAR:", lugar, ""],
    [], // Fila en blanco
    // Encabezados de la tabla de participantes (sin columna de firma)
    [
      "N°",
      "NOMBRES Y APELLIDOS",
      "INSTITUCIÓN / EMPRESA",
      "ÁREA DE INTERÉS / CARGO / OCUPACIÓN",
      "TELÉFONO FIJO / CELULAR",
      "CORREO ELECTRÓNICO",
    ],
  ];

  // Si no hay asistentes, agregamos una fila informativa
  if (!asistentes || asistentes.length === 0) {
    rows.push([1, "Sin participantes registrados aún", "-", "-", "-", "-"]);
  } else {
    asistentes.forEach((a, index) => {
      const nombreCompleto = (
        a.nombre ||
        `${a.nombres || ""} ${a.apellidos || ""}`
      ).trim() || "Anónimo";

      // Determinar institución/empresa según relación universitaria
      let institucion = "Institución Universitaria ITM";
      if (a.institucion) {
        institucion = a.institucion;
      } else if (a.relacionUniversidad === "Externo") {
        institucion = "Externo / Particular";
      }

      // Ocupación / Área / Programa
      const cargoOcupacion =
        a.programaAcademico ||
        a.relacionUniversidad ||
        "Estudiante";

      const telefono = a.telefono || "-";
      const correo = a.correo || "-";

      rows.push([
        index + 1,
        nombreCompleto,
        institucion,
        cargoOcupacion,
        telefono,
        correo,
      ]);
    });
  }

  // Fila de separación antes del pie legal
  rows.push([]);
  rows.push([
    "Total asistentes registrados: " + (asistentes ? asistentes.length : 0),
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([]);

  // Pie legal Habeas Data
  rows.push([
    "AUTORIZACIÓN TRATAMIENTO DE DATOS PERSONALES (Ley 1581 de 2012 y Decreto 1377 de 2013)",
    "",
    "",
    "",
    "",
    "",
  ]);
  rows.push([
    "Con el diligenciamiento de este formato, los participantes autorizan de manera voluntaria, previa, explícita e informada a la Institución Universitaria ITM para recolectar, almacenar, usar, circular y suprimir sus datos personales con fines académicos, institucionales, estadísticos, de certificación y de contacto para futuras actividades del Observatorio Astronómico ITM.",
    "",
    "",
    "",
    "",
    "",
  ]);

  // Crear la hoja de trabajo
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Configuración de anchos de columna (en caracteres)
  ws["!cols"] = [
    { wch: 6 },  // N°
    { wch: 38 }, // NOMBRES Y APELLIDOS
    { wch: 30 }, // INSTITUCIÓN / EMPRESA
    { wch: 35 }, // ÁREA DE INTERÉS / CARGO / OCUPACIÓN
    { wch: 22 }, // TELÉFONO FIJO / CELULAR
    { wch: 36 }, // CORREO ELECTRÓNICO
  ];

  // Configuración de celdas combinadas (Merges)
  ws["!merges"] = [
    // Encabezado institucional
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // INSTITUCIÓN UNIVERSITARIA ITM
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }, // SISTEMA INTEGRADO DE GESTIÓN
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }, // LISTADO DE ASISTENCIA...
    // Bloque evento
    { s: { r: 5, c: 0 }, e: { r: 5, c: 5 } }, // DATOS DE LA ACTIVIDAD
    { s: { r: 6, c: 1 }, e: { r: 6, c: 5 } }, // NOMBRE DE LA ACTIVIDAD valor
    { s: { r: 7, c: 1 }, e: { r: 7, c: 2 } }, // FACILITADOR valor
    { s: { r: 7, c: 4 }, e: { r: 7, c: 5 } }, // FECHA valor
    { s: { r: 8, c: 1 }, e: { r: 8, c: 2 } }, // HORARIO valor
    { s: { r: 8, c: 4 }, e: { r: 8, c: 5 } }, // LUGAR valor
    // Pie
    { s: { r: rows.length - 2, c: 0 }, e: { r: rows.length - 2, c: 5 } }, // TÍTULO HABEAS DATA
    { s: { r: rows.length - 1, c: 0 }, e: { r: rows.length - 1, c: 5 } }, // TEXTO HABEAS DATA
  ];

  // Crear libro y agregar la hoja
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "FG 031 Asistencia");

  // Generar nombre de archivo limpio
  const tituloLimpio = (evento.titulo || "Evento")
    .toLowerCase()
    .replace(/[^a-z0-9]/gi, "_")
    .substring(0, 30);
  const nombreArchivo = `FG_031_Asistencia_${tituloLimpio}_${fechaEvento}.xlsx`;

  // Descargar archivo Excel
  XLSX.writeFile(wb, nombreArchivo);
}

