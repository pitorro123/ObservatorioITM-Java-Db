package com.observatorio.backend.controladores;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.observatorio.backend.dtos.contenido.ObservatorioRequest;
import com.observatorio.backend.dtos.contenido.SemilleroRequest;
import com.observatorio.backend.servicios.ContenidoServicio;

@RestController
@RequestMapping("/api/contenido")
public class ContenidoControlador {

	private final ContenidoServicio servicio;

	public ContenidoControlador(ContenidoServicio servicio) {
		this.servicio = servicio;
	}

	// Lectura pública (las páginas públicas las muestra sin iniciar sesión)
	@GetMapping("/semillero")
	public Map<String, Object> semillero() {
		return servicio.obtenerSemillero();
	}

	@GetMapping("/observatorio")
	public Map<String, Object> observatorio() {
		return servicio.obtenerObservatorio();
	}

	// Edición requiere sesión (Administrador o Docente)
	@PutMapping("/semillero")
	public Map<String, Object> guardarSemillero(@RequestBody SemilleroRequest request) {
		return servicio.guardarSemillero(request);
	}

	@PutMapping("/observatorio")
	public Map<String, Object> guardarObservatorio(@RequestBody ObservatorioRequest request) {
		return servicio.guardarObservatorio(request);
	}
}