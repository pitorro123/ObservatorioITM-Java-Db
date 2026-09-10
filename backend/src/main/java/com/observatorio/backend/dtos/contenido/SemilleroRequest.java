package com.observatorio.backend.dtos.contenido;

import java.util.List;

public record SemilleroRequest(
		String titulo,
		String descripcion,
		List<String> objetivos,
		String comoParticipar) {
}