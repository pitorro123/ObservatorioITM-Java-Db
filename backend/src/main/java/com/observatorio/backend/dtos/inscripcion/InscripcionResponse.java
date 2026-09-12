package com.observatorio.backend.dtos.inscripcion;

import java.time.Instant;

public record InscripcionResponse(
		Long id,
		String codigo,
		Long eventoId,
		String nombre,
		String tipoDocumento,
		String numeroDocumento,
		String correo,
		String telefono,
		String relacionUniversidad,
		String programaAcademico,
		Boolean esMasivo,
		String asistencia,
		Instant fechaInscripcion) {
}