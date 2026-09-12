package com.observatorio.backend.dtos.evento;

public record EventoRequest(
		String titulo,
		String descripcion,
		String fecha,
		String hora,
		String lugar,
		String imagen,
		String estado,
		String tipo,
		Boolean esMasivo,
		Integer capacidad,
		String ubicacionMapa,
		Long creadoPorId,
		String creadoPorNombre,
		String creadoPorRol,
		String motivoCancelacion) {
}