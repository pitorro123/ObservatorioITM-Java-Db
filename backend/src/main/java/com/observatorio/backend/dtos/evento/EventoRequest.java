package com.observatorio.backend.dtos.evento;

public record EventoRequest(
		String titulo,
		String descripcion,
		String fecha,
		String hora,
		String lugar,
		String imagen,
		String estado,
		String tipo) {
}