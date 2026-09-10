package com.observatorio.backend.dtos.evento;

import java.time.LocalDate;

public record EventoResponse(
		Long id,
		String titulo,
		String descripcion,
		LocalDate fecha,
		String hora,
		String lugar,
		String imagen,
		String estado,
		String tipo,
		int inscritos,
		int asistentes) {
}