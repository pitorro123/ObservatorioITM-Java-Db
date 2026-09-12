package com.observatorio.backend.dtos.inscripcion;

public record InscripcionRequest(
		Long eventoId,
		String nombre,
		String tipoDocumento,
		String numeroDocumento,
		String correo,
		String telefono,
		String relacionUniversidad,
		String programaAcademico) {
}