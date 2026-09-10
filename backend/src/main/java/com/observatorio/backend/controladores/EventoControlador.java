package com.observatorio.backend.controladores;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.observatorio.backend.dtos.evento.EventoRequest;
import com.observatorio.backend.dtos.evento.EventoResponse;
import com.observatorio.backend.servicios.EventoServicio;

@RestController
@RequestMapping("/api/eventos")
public class EventoControlador {

	private final EventoServicio servicio;

	public EventoControlador(EventoServicio servicio) {
		this.servicio = servicio;
	}

	@GetMapping("/publicados")
	public List<EventoResponse> listarPublicados() {
		return servicio.listarPublicados();
	}

	@GetMapping("/p/{id}")
	public EventoResponse obtenerPublico(@PathVariable Long id) {
		return servicio.obtenerPublico(id);
	}

	@GetMapping
	public List<EventoResponse> listarTodos() {
		return servicio.listarTodos();
	}

	@GetMapping("/{id}")
	public EventoResponse obtener(@PathVariable Long id) {
		return servicio.obtener(id);
	}

	@PostMapping
	public EventoResponse crear(@RequestBody EventoRequest request) {
		return servicio.crear(request);
	}

	@PutMapping("/{id}")
	public EventoResponse editar(@PathVariable Long id, @RequestBody EventoRequest request) {
		return servicio.editar(id, request);
	}

	@PutMapping("/{id}/publicar")
	public EventoResponse publicar(@PathVariable Long id) {
		return servicio.publicar(id);
	}

	@PutMapping("/{id}/cancelar")
	public EventoResponse cancelar(@PathVariable Long id) {
		return servicio.cancelar(id);
	}

	@DeleteMapping("/{id}")
	public Map<String, Object> eliminar(@PathVariable Long id) {
		servicio.eliminar(id);
		return Map.of("exito", true);
	}
}