package com.observatorio.backend.dtos.inscripcion;

import java.time.Instant;

public record ValidacionResponse(
		Long id,
		String codigo,
		String nombre,
		String nombres,
		String apellidos,
		String tipoDocumento,
		String numeroDocumento,
		String correo,
		String telefono,
		String relacionUniversidad,
		String programaAcademico,
		Boolean esMasivo,
		String asistencia,
		Instant fechaHoraAsistencia,
		Long eventoId,
		String eventoTitulo,
		String eventoFecha,
		String eventoHora,
		String eventoLugar) {
}