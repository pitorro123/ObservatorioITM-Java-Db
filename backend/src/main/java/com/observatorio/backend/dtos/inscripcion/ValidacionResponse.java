package com.observatorio.backend.dtos.inscripcion;

public record ValidacionResponse(
		Long id,
		String codigo,
		String nombre,
		String tipoDocumento,
		String numeroDocumento,
		String correo,
		String telefono,
		String relacionUniversidad,
		String programaAcademico,
		Boolean esMasivo,
		String asistencia,
		Long eventoId,
		String eventoTitulo,
		String eventoFecha,
		String eventoHora,
		String eventoLugar) {
}