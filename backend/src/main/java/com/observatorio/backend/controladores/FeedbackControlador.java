package com.observatorio.backend.controladores;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.observatorio.backend.dtos.feedback.FeedbackRequest;
import com.observatorio.backend.dtos.feedback.FeedbackResponse;
import com.observatorio.backend.servicios.FeedbackServicio;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackControlador {

	private final FeedbackServicio servicio;

	public FeedbackControlador(FeedbackServicio servicio) {
		this.servicio = servicio;
	}

	// Endpoint público: los participantes comentan el evento
	@PostMapping
	public FeedbackResponse agregar(@RequestBody FeedbackRequest request) {
		return servicio.agregar(request);
	}

	@GetMapping("/evento/{eventoId}")
	public List<FeedbackResponse> listarPorEvento(@PathVariable Long eventoId) {
		return servicio.listarPorEvento(eventoId);
	}
}