package com.observatorio.backend.dtos.inscripcion;

import java.time.Instant;

public record InscripcionResponse(
		Long id,
		String codigo,
		Long eventoId,
		String nombre,
		String nombres,
		String apellidos,
		String tipoDocumento,
		String numeroDocumento,
		String correo,
		String telefono,
		String relacionUniversidad,
		String programaAcademico,
		Long programaId,
		Boolean esMasivo,
		String asistencia,
		Instant fechaHoraAsistencia,
		Instant fechaInscripcion) {
}