package com.observatorio.backend.servicios;

import java.util.List;

import org.springframework.stereotype.Service;

import com.observatorio.backend.dtos.feedback.FeedbackRequest;
import com.observatorio.backend.dtos.feedback.FeedbackResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Feedback;
import com.observatorio.backend.repositorios.IFeedbackRepositorio;

@Service
public class FeedbackServicio {

	private final IFeedbackRepositorio repositorio;

	public FeedbackServicio(IFeedbackRepositorio repositorio) {
		this.repositorio = repositorio;
	}

	private FeedbackResponse aRespuesta(Feedback feedback) {
		return new FeedbackResponse(feedback.getId(), feedback.getEventoId(), feedback.getNombre(),
				feedback.getCalificacion(), feedback.getComentario(), feedback.getFecha());
	}

	public FeedbackResponse agregar(FeedbackRequest request) {
		if (request.calificacion() == null || request.calificacion() < 1 || request.calificacion() > 5) {
			throw new ApiException(400, "Selecciona una calificación de 1 a 5 estrellas.");
		}

		String nombre = (request.nombre() == null ? "" : request.nombre()).trim();
		if (nombre.isEmpty()) {
			nombre = "Anónimo";
		}

		if (repositorio.existsByEventoIdAndNombreIgnoreCase(request.eventoId(), nombre)) {
			throw new ApiException(409, "Ya enviaste tu opinión para este evento.");
		}

		Feedback feedback = new Feedback();
		feedback.setEventoId(request.eventoId());
		feedback.setNombre(nombre);
		feedback.setCalificacion(request.calificacion());
		feedback.setComentario((request.comentario() == null ? "" : request.comentario()).trim());

		return aRespuesta(repositorio.save(feedback));
	}

	public List<FeedbackResponse> listarPorEvento(Long eventoId) {
		return repositorio.findByEventoIdOrderByFechaDesc(eventoId).stream()
				.map(this::aRespuesta).toList();
	}
}