package com.observatorio.backend.dtos.inscripcion;

public record InscripcionRequest(
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
		Long programaId) {
}