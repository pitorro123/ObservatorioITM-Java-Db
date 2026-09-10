package com.observatorio.backend.servicios;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.observatorio.backend.dtos.inscripcion.InscripcionRequest;
import com.observatorio.backend.dtos.inscripcion.InscripcionResponse;
import com.observatorio.backend.dtos.inscripcion.ValidacionResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Evento;
import com.observatorio.backend.modelos.Inscripcion;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IEventoRepositorio;
import com.observatorio.backend.repositorios.IInscripcionRepositorio;

@Service
public class InscripcionServicio {

	private static final DateTimeFormatter FECHA_ES =
			DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", new Locale("es", "CO"));

	private final IInscripcionRepositorio inscripciones;
	private final IEventoRepositorio eventos;
	private final CorreoServicio correo;
	private final QrServicio qr;

	public InscripcionServicio(IInscripcionRepositorio inscripciones, IEventoRepositorio eventos,
			CorreoServicio correo, QrServicio qr) {
		this.inscripciones = inscripciones;
		this.eventos = eventos;
		this.correo = correo;
		this.qr = qr;
	}

	private InscripcionResponse aRespuesta(Inscripcion inscripcion) {
		return new InscripcionResponse(inscripcion.getCodigo(), inscripcion.getEventoId(),
				inscripcion.getNombre(), inscripcion.getCorreo(), inscripcion.getTelefono(),
				inscripcion.getAsistencia(), inscripcion.getFechaInscripcion());
	}

	private String generarCodigo() {
		String marca = Long.toUnsignedString(System.currentTimeMillis(), 36).toUpperCase();
		String aleatorio = Long.toUnsignedString((long) (Math.random() * 1e12), 36).toUpperCase();
		return "ITM-" + marca + "-" + aleatorio;
	}

	public InscripcionResponse inscribir(InscripcionRequest request) {
		Evento evento = eventos.findById(request.eventoId())
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));

		if (!"publicado".equals(evento.getEstado())) {
			throw new ApiException(400, "El evento no está disponible para inscripción.");
		}

		String nombre = (request.nombre() == null ? "" : request.nombre()).trim();
		String correoTexto = (request.correo() == null ? "" : request.correo()).trim();
		if (nombre.isEmpty() || !correoTexto.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
			throw new ApiException(400, "Ingresa tu nombre y un correo electrónico válido.");
		}

		if (inscripciones.existsByEventoIdAndCorreoIgnoreCase(evento.getId(), correoTexto)) {
			throw new ApiException(409, "Ya estás inscrito en este evento con ese correo.");
		}

		String codigo = generarCodigo();
		Inscripcion inscripcion = new Inscripcion();
		inscripcion.setCodigo(codigo);
		inscripcion.setEventoId(evento.getId());
		inscripcion.setNombre(nombre);
		inscripcion.setCorreo(correoTexto);
		inscripcion.setTelefono((request.telefono() == null ? "" : request.telefono()).trim());
		inscripcion.setAsistencia("Pendiente");
		inscripciones.save(inscripcion);

		evento.setInscritos((evento.getInscritos() == null ? 0 : evento.getInscritos()) + 1);
		eventos.save(evento);

		String qrBase64 = qr.generarQrBase64(codigo, 300);
		correo.enviarHtml(inscripcion.getCorreo(), "¡Inscripción confirmada! - Observatorio ITM",
				correo.plantillas().correoConfirmacionInscripcion(
						inscripcion.getNombre(), evento.getTitulo(),
						evento.getFecha().format(FECHA_ES), evento.getHora(), evento.getLugar(),
						inscripcion.getCodigo(), qrBase64));

		return aRespuesta(inscripcion);
	}

	public ValidacionResponse validarCodigo(String codigoBuscado) {
		Inscripcion inscripcion = inscripciones.findByCodigoIgnoreCase(codigoBuscado)
				.orElseThrow(() -> new ApiException(404, "Código de registro no encontrado."));

		Evento evento = eventos.findById(inscripcion.getEventoId())
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));

		return new ValidacionResponse(inscripcion.getCodigo(), inscripcion.getNombre(),
				inscripcion.getCorreo(), inscripcion.getTelefono(), inscripcion.getAsistencia(),
				inscripcion.getEventoId(), evento.getTitulo(),
				evento.getFecha().format(FECHA_ES), evento.getHora(), evento.getLugar());
	}

	public InscripcionResponse marcarAsistencia(String codigoBuscado) {
		Inscripcion inscripcion = inscripciones.findByCodigoIgnoreCase(codigoBuscado)
				.orElseThrow(() -> new ApiException(404, "Código de registro no encontrado."));

		if ("Asistió".equals(inscripcion.getAsistencia())) {
			throw new ApiException(409, "Este código ya fue validado anteriormente.");
		}

		inscripcion.setAsistencia("Asistió");
		inscripciones.save(inscripcion);

		eventos.findById(inscripcion.getEventoId()).ifPresent(evento -> {
			evento.setAsistentes((evento.getAsistentes() == null ? 0 : evento.getAsistentes()) + 1);
			eventos.save(evento);
		});

		return aRespuesta(inscripcion);
	}

	public List<InscripcionResponse> listarPorEvento(Long eventoId) {
		return inscripciones.findByEventoIdOrderByFechaInscripcionAsc(eventoId).stream()
				.map(this::aRespuesta).toList();
	}

	public void enviarQrDocente(String codigoBuscado, Usuario docente) {
		Inscripcion inscripcion = inscripciones.findByCodigoIgnoreCase(codigoBuscado)
				.orElseThrow(() -> new ApiException(404, "Código de registro no encontrado."));

		Evento evento = eventos.findById(inscripcion.getEventoId())
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));

		String qrBase64 = qr.generarQrBase64(inscripcion.getCodigo(), 300);
		correo.enviarHtml(docente.getCorreo(), "Código de control del participante - Observatorio ITM",
				correo.plantillas().correoQrDocente(docente.getNombre(), evento.getTitulo(),
						inscripcion.getNombre(), inscripcion.getCodigo(), qrBase64));
	}
}