package com.observatorio.backend.dtos.contenido;

import java.util.List;

public record ObservatorioRequest(
		String titulo,
		String descripcion,
		List<String> trayectoria,
		String mision,
		String vision) {
}