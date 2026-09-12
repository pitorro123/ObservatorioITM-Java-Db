package com.observatorio.backend.controladores;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.observatorio.backend.dtos.inscripcion.AsistenciaRequest;
import com.observatorio.backend.dtos.inscripcion.InscripcionRequest;
import com.observatorio.backend.dtos.inscripcion.InscripcionResponse;
import com.observatorio.backend.dtos.inscripcion.ValidacionResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.servicios.InscripcionServicio;
import com.observatorio.backend.servicios.SeguridadServicio;

@RestController
@RequestMapping("/api/inscripciones")
public class InscripcionControlador {

	private final InscripcionServicio servicio;
	private final SeguridadServicio seguridad;

	public InscripcionControlador(InscripcionServicio servicio, SeguridadServicio seguridad) {
		this.servicio = servicio;
		this.seguridad = seguridad;
	}

	// Endpoint público: el público general se inscribe
	@PostMapping
	public InscripcionResponse inscribir(@RequestBody InscripcionRequest request) {
		return servicio.inscribir(request);
	}

	@GetMapping
	public List<InscripcionResponse> listarTodas() {
		return servicio.listarTodas();
	}

	@GetMapping("/evento/{eventoId}")
	public List<InscripcionResponse> listarPorEvento(@PathVariable Long eventoId) {
		return servicio.listarPorEvento(eventoId);
	}

	@GetMapping("/validar/{termino}")
	public ValidacionResponse validar(
			@PathVariable String termino,
			@RequestParam(required = false) Long eventoId) {
		ValidacionResponse resultado = servicio.validarCodigo(termino, eventoId);
		if ("Asistió".equals(resultado.asistencia())) {
			throw new ApiException(409, "Este registro ya fue validado anteriormente.");
		}
		return resultado;
	}

	@PostMapping("/asistencia")
	public InscripcionResponse marcarAsistencia(@RequestBody AsistenciaRequest request) {
		return servicio.marcarAsistencia(request.valorTermino(), request.eventoId());
	}

	@PostMapping("/{codigo}/enviar-qr-docente")
	public Map<String, Object> enviarQrDocente(@PathVariable String codigo) {
		servicio.enviarQrDocente(codigo, seguridad.usuarioActual());
		return Map.of("exito", true);
	}
}