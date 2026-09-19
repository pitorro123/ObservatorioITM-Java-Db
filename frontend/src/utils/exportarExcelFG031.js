import ExcelJS from "exceljs/dist/exceljs.min.js";
import { PLANTILLA_FG031_BASE64 } from "./plantillaFG031Base64.js";

/**
 * Genera y descarga el formato institucional oficial del ITM:
 * FG 031 - LISTADO DE ASISTENCIA - VISITAS ESTRATÉGICAS, DE RELACIONAMIENTO O EVENTOS ITM
 * Versión: 03 | Código: FG 031
 *
 * Expande dinámicamente las filas cuando hay más de 25 asistentes:
 * - Aplica números consecutivos continuos (26, 27, 28...).
 * - Dibuja la cuadrícula completa con bordes idénticos ('thin' en todas las celdas A-L).
 * - Mantiene los mismos merges (A:C para nombres, F:G para teléfono, H:L para correo).
 * - Preserva el logo oficial de ITM y encabezados del Sistema Integrado de Gestión.
 *
 * @param {Object} evento - Datos del evento (titulo, docente, fecha, hora, lugar, etc.)
 * @param {Array} asistentes - Lista de inscripciones / participantes registrados
 */
export async function exportarExcelFG031(evento = {}, asistentes = []) {
  try {
    // 1. Cargar la plantilla oficial del ITM desde Base64
    const binarioString = atob(PLANTILLA_FG031_BASE64);
    const bytes = new Uint8Array(binarioString.length);
    for (let i = 0; i < binarioString.length; i++) {
      bytes[i] = binarioString.charCodeAt(i);
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(bytes.buffer);
    const ws = wb.worksheets[0];

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

    // 2. Diligenciar datos de la actividad en las celdas oficiales
    ws.getCell("A5").value = `NOMBRE DE LA ACTIVIDAD / VISITA:  ${nombreActividad}`;
    ws.getCell("A6").value = `FACILITADOR:  ${facilitador}`;
    ws.getCell("A7").value = `FECHA:  ${fechaEvento}`;
    ws.getCell("A8").value = `LUGAR:  ${lugar}`;
    ws.getCell("G8").value = `Desde:  ${horaDesde}`;
    ws.getCell("J8").value = `Hasta:  ${horaHasta || "Fin de la actividad"}`;

    // Estilos institucionales
    const bordeInstitucional = {
      top: { style: "thin", color: { argb: "FF000000" } },
      left: { style: "thin", color: { argb: "FF000000" } },
      bottom: { style: "thin", color: { argb: "FF000000" } },
      right: { style: "thin", color: { argb: "FF000000" } },
    };

    const fuenteCeldas = { name: "Arial", size: 10, family: 2 };

    // 3. Mapear asistentes en las filas de la tabla oficial
    const listaAsistentes = Array.isArray(asistentes) ? asistentes : [];
    const total = listaAsistentes.length;

    if (total > 0) {
      listaAsistentes.forEach((a, idx) => {
        const consecutivo = idx + 1;
        const rowNum = 10 + consecutivo; // idx 0 -> fila 11 (1), idx 24 -> fila 35 (25)
        const row = ws.getRow(rowNum);

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

        let cargoOcupacion =
          a.programaAcademico ||
          a.relacionUniversidad ||
          "Estudiante";

        if (evento.tipo === "nasa") {
          const partesLogistica = [];
          if (a.eps) partesLogistica.push(`EPS: ${a.eps}`);
          if (a.esVegetariano) partesLogistica.push("Vegetariano");
          if (a.alergiasAlimentos && a.alergiasAlimentos.toLowerCase() !== "ninguna") {
            partesLogistica.push(`Alergia: ${a.alergiasAlimentos}`);
          }
          if (a.tipoVehiculo && a.tipoVehiculo !== "Ninguno") {
            partesLogistica.push(`Parq: ${a.tipoVehiculo} ${a.placaVehiculo || ""}`.trim());
          }
          if (partesLogistica.length > 0) {
            cargoOcupacion = `${cargoOcupacion} [${partesLogistica.join(" | ")}]`;
          }
        }

        const telefono = a.telefono || "-";
        const correo = a.correo || "-";

        // Si supera las 25 filas originales de la plantilla (fila 36 en adelante)
        if (consecutivo > 25) {
          row.height = 15;

          // Combinar celdas exactamente igual que en filas 11-35
          ws.mergeCells(`A${rowNum}:C${rowNum}`);
          ws.mergeCells(`F${rowNum}:G${rowNum}`);
          ws.mergeCells(`H${rowNum}:L${rowNum}`);

          // Aplicar bordes, fuente y alineación en todas las columnas de la fila (A a L)
          for (let col = 1; col <= 12; col++) {
            const celda = row.getCell(col);
            celda.border = bordeInstitucional;
            celda.font = fuenteCeldas;
            celda.alignment = {
              vertical: "middle",
              horizontal:
                col === 1
                  ? "left"
                  : col === 4 || col === 5 || col === 8
                  ? "left"
                  : "center",
              wrapText: true,
            };
          }
        }

        // Asignar los datos del participante
        ws.getCell(`A${rowNum}`).value = `${consecutivo}.  ${nombreCompleto}`;
        ws.getCell(`D${rowNum}`).value = institucion;
        ws.getCell(`E${rowNum}`).value = cargoOcupacion;
        ws.getCell(`F${rowNum}`).value = telefono;
        ws.getCell(`H${rowNum}`).value = correo;
      });
    }

    // 4. Generar nombre de archivo oficial
    const tituloLimpio = (evento.titulo || "Evento")
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, "_")
      .substring(0, 30);
    const nombreArchivo = `FG_031_Listado_de_asistencia_${tituloLimpio}_${fechaEvento}.xlsx`;

    // 5. Descargar en el navegador vía Blob
    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al generar Excel oficial FG 031 con ExcelJS:", error);
  }
}
