package com.observatorio.backend.dtos.inscripcion;

import java.time.Instant;

public record InscripcionResponse(
		String codigo,
		Long eventoId,
		String nombre,
		String correo,
		String telefono,
		String asistencia,
		Instant fechaInscripcion) {
}