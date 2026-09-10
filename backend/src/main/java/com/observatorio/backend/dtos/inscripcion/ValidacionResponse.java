package com.observatorio.backend.dtos.inscripcion;

public record ValidacionResponse(
		String codigo,
		String nombre,
		String correo,
		String telefono,
		String asistencia,
		Long eventoId,
		String eventoTitulo,
		String eventoFecha,
		String eventoHora,
		String eventoLugar) {
}