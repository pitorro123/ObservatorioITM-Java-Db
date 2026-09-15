import * as XLSX from "xlsx";
import { PLANTILLA_FG031_BASE64 } from "./plantillaFG031Base64.js";

/**
 * Genera y descarga el formato institucional oficial del ITM:
 * FG 031 - LISTADO DE ASISTENCIA - VISITAS ESTRATÉGICAS, DE RELACIONAMIENTO O EVENTOS ITM
 * Versión: 03 | Código: FG 031
 *
 * Utiliza la plantilla oficial original del ITM con su logotipo, membrete y estilos oficiales.
 *
 * @param {Object} evento - Datos del evento (titulo, docente, fecha, hora, lugar, etc.)
 * @param {Array} asistentes - Lista de inscripciones / participantes registrados
 */
export function exportarExcelFG031(evento = {}, asistentes = []) {
  try {
    // 1. Cargar la plantilla oficial del ITM desde Base64
    const binarioString = atob(PLANTILLA_FG031_BASE64);
    const bytes = new Uint8Array(binarioString.length);
    for (let i = 0; i < binarioString.length; i++) {
      bytes[i] = binarioString.charCodeAt(i);
    }
    const wb = XLSX.read(bytes, { type: "array", cellStyles: true });
    const ws = wb.Sheets[wb.SheetNames[0]];

    const nombreActividad = (evento.titulo || "Evento Observatorio ITM").toUpperCase();
    const facilitador =
      evento.creadoPorNombre ||
      evento.docenteNombre ||
      evento.docente ||
      evento.creadoPor ||
      "Equipo Observatorio ITM";
    const fechaEvento = evento.fecha || new Date().toISOString().split("T")[0];
    const horaDesde = evento.hora || evento.horaInicio || "Por definir";
    const horaHasta = evento.horaFin || "";
    const lugar = evento.lugar || "Observatorio Astronómico ITM - Sede Fraternidad";

    // 2. Diligenciar datos de la actividad / evento en las celdas de la plantilla
    ws["A5"] = { t: "s", v: `NOMBRE DE LA ACTIVIDAD / VISITA:  ${nombreActividad}` };
    ws["A6"] = { t: "s", v: `FACILITADOR:  ${facilitador}` };
    ws["A7"] = { t: "s", v: `FECHA:  ${fechaEvento}` };
    ws["A8"] = { t: "s", v: `LUGAR:  ${lugar}` };
    ws["G8"] = { t: "s", v: `Desde:  ${horaDesde}` };
    ws["J8"] = { t: "s", v: `Hasta:  ${horaHasta || "Fin de la actividad"}` };

    // 3. Mapear asistentes en las filas de la tabla oficial
    // Fila 11 a 21: slots 1 a 11
    // Fila 23 a 36: slots 12 a 25
    const filasSlots = [
      11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36
    ];

    if (Array.isArray(asistentes) && asistentes.length > 0) {
      asistentes.forEach((a, idx) => {
        const fila = idx < filasSlots.length ? filasSlots[idx] : 37 + (idx - filasSlots.length);

        const nombreCompleto = (
          a.nombre ||
          `${a.nombres || ""} ${a.apellidos || ""}`
        ).trim() || "Participante";

        let institucion = "Institución Universitaria ITM";
        if (a.institucion) {
          institucion = a.institucion;
        } else if (a.relacionUniversidad === "Externo") {
          institucion = "Particular / Externo";
        }

        const cargoOcupacion =
          a.programaAcademico ||
          a.relacionUniversidad ||
          "Estudiante";

        const telefono = a.telefono || "-";
        const correo = a.correo || "-";

        ws[`A${fila}`] = { t: "n", v: idx + 1 };
        ws[`B${fila}`] = { t: "s", v: nombreCompleto };
        ws[`D${fila}`] = { t: "s", v: institucion };
        ws[`E${fila}`] = { t: "s", v: cargoOcupacion };
        ws[`F${fila}`] = { t: "s", v: telefono };
        ws[`H${fila}`] = { t: "s", v: correo };
      });
    }

    // 4. Generar nombre de archivo oficial
    const tituloLimpio = (evento.titulo || "Evento")
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "_")
      .substring(0, 30);
    const nombreArchivo = `FG_031_Listado_de_asistencia_${tituloLimpio}_${fechaEvento}.xlsx`;

    // 5. Descargar el archivo
    XLSX.writeFile(wb, nombreArchivo);
  } catch (error) {
    console.error("Error al generar Excel oficial FG 031:", error);
    // Fallback de contingencia si el navegador falla procesando el template binario
    exportarExcelFG031Fallback(evento, asistentes);
  }
}

function exportarExcelFG031Fallback(evento = {}, asistentes = []) {
  const nombreActividad = (evento.titulo || "Evento Observatorio ITM").toUpperCase();
  const facilitador =
    evento.creadoPorNombre ||
    evento.docenteNombre ||
    "Equipo Observatorio ITM";
  const fechaEvento = evento.fecha || new Date().toISOString().split("T")[0];
  const lugar = evento.lugar || "Observatorio ITM - Sede Fraternidad";

  const rows = [
    ["INSTITUCIÓN UNIVERSITARIA ITM", "", "", "", "", ""],
    ["SISTEMA INTEGRADO DE GESTIÓN", "", "", "", "", ""],
    ["LISTADO DE ASISTENCIA - VISITAS ESTRATÉGICAS, DE RELACIONAMIENTO O EVENTOS ITM", "", "", "", "", ""],
    ["CÓDIGO: FG 031", "VERSIÓN: 03", "FECHA: 15-04-2024", "", "", ""],
    [],
    [`NOMBRE DE LA ACTIVIDAD / VISITA: ${nombreActividad}`],
    [`FACILITADOR: ${facilitador}`],
    [`FECHA: ${fechaEvento}`, "", "", `HORARIO: ${evento.hora || ""}`],
    [`LUGAR: ${lugar}`],
    [],
    ["N°", "NOMBRES Y APELLIDOS", "INSTITUCIÓN / EMPRESA", "ÁREA DE INTERÉS / CARGO / OCUPACIÓN", "TELÉFONO FIJO / CELULAR", "CORREO ELECTRÓNICO"],
  ];

  if (!asistentes || asistentes.length === 0) {
    rows.push([1, "Sin participantes registrados aún", "-", "-", "-", "-"]);
  } else {
    asistentes.forEach((a, i) => {
      rows.push([
        i + 1,
        a.nombre || `${a.nombres || ""} ${a.apellidos || ""}`.trim() || "Anónimo",
        a.institucion || (a.relacionUniversidad === "Externo" ? "Externo" : "Institución Universitaria ITM"),
        a.programaAcademico || a.relacionUniversidad || "Estudiante",
        a.telefono || "-",
        a.correo || "-",
      ]);
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "FG 031 Asistencia");
  XLSX.writeFile(wb, `FG_031_Listado_de_asistencia_${fechaEvento}.xlsx`);
}
