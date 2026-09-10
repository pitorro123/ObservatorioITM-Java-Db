package com.observatorio.backend.dtos.feedback;

import java.time.Instant;

public record FeedbackResponse(
		Long id,
		Long eventoId,
		String nombre,
		Integer calificacion,
		String comentario,
		Instant fecha) {
}