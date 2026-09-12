package com.observatorio.backend.dtos.inscripcion;

public record AsistenciaRequest(String codigo, String termino, Long eventoId) {
	public String valorTermino() {
		if (termino != null && !termino.isBlank()) return termino.trim();
		if (codigo != null && !codigo.isBlank()) return codigo.trim();
		return "";
	}
}