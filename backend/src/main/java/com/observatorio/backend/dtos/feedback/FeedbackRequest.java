package com.observatorio.backend.dtos.feedback;

public record FeedbackRequest(Long eventoId, String nombre, Integer calificacion, String comentario) {
}