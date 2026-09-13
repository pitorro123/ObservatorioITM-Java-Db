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
	private final com.observatorio.backend.servicios.CorreoServicio correo;

	public InscripcionControlador(InscripcionServicio servicio, SeguridadServicio seguridad,
			com.observatorio.backend.servicios.CorreoServicio correo) {
		this.servicio = servicio;
		this.seguridad = seguridad;
		this.correo = correo;
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

	@GetMapping("/diagnostico-correo")
	public Map<String, Object> diagnosticoCorreo(@RequestParam(defaultValue = "yessik.lave08@gmail.com") String para) {
		Map<String, Object> resp = new java.util.HashMap<>();
		String remitente = correo.getRemitente();
		resp.put("remitente", remitente != null && !remitente.isBlank() ? remitente : "NO_DEFINIDO");
		try {
			var msg = correo.getMailSender().createMimeMessage();
			var helper = new org.springframework.mail.javamail.MimeMessageHelper(msg, true, "UTF-8");
			helper.setFrom(remitente);
			helper.setTo(para);
			helper.setSubject("Diagnostico Observatorio");
			helper.setText("<p>Prueba directa</p>", true);
			correo.getMailSender().send(msg);
			resp.put("enviado", true);
		} catch (Exception e) {
			resp.put("enviado", false);
			resp.put("error", e.getClass().getName() + ": " + e.getMessage());
			if (e.getCause() != null) {
				resp.put("causa", e.getCause().getClass().getName() + ": " + e.getCause().getMessage());
			}
		}
		return resp;
	}
}