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
		return new InscripcionResponse(
				inscripcion.getId(),
				inscripcion.getCodigo(),
				inscripcion.getEventoId(),
				inscripcion.getNombre(),
				inscripcion.getTipoDocumento(),
				inscripcion.getNumeroDocumento(),
				inscripcion.getCorreo(),
				inscripcion.getTelefono(),
				inscripcion.getRelacionUniversidad(),
				inscripcion.getProgramaAcademico(),
				inscripcion.getEsMasivo(),
				inscripcion.getAsistencia(),
				inscripcion.getFechaInscripcion());
	}

	private String generarCodigo4Digitos(Long eventoId) {
		for (int i = 0; i < 10000; i++) {
			int num = (int) (1000 + Math.random() * 9000);
			String codigo = String.valueOf(num);
			if (!inscripciones.existsByCodigo(codigo)) {
				return codigo;
			}
		}
		for (int i = 0; i < 10000; i++) {
			int num = (int) (1000 + Math.random() * 9000);
			String codigo = String.valueOf(num);
			if (inscripciones.findFirstByEventoIdAndCodigoIgnoreCase(eventoId, codigo).isEmpty()) {
				return codigo;
			}
		}
		return String.valueOf((int) (1000 + Math.random() * 9000));
	}

	public InscripcionResponse inscribir(InscripcionRequest request) {
		Evento evento = eventos.findById(request.eventoId())
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));

		if (!"publicado".equals(evento.getEstado())) {
			throw new ApiException(400, "El evento no está disponible para inscripción.");
		}

		boolean esMasivo = Boolean.TRUE.equals(evento.getEsMasivo());
		int capacidad = evento.getCapacidad() != null && evento.getCapacidad() > 0 ? evento.getCapacidad() : 50;
		int inscritos = evento.getInscritos() != null ? evento.getInscritos() : 0;

		if (!esMasivo && inscritos >= capacidad) {
			throw new ApiException(400, "Lo sentimos, los cupos para este evento ya se han agotado.");
		}

		String nombre = (request.nombre() == null ? "" : request.nombre()).trim();
		String correoTexto = (request.correo() == null ? "" : request.correo()).trim().toLowerCase();
		String docLimpio = (request.numeroDocumento() == null ? "" : request.numeroDocumento()).trim();

		if (nombre.isEmpty() || !correoTexto.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
			throw new ApiException(400, "Ingresa tu nombre y un correo electrónico válido.");
		}

		if (inscripciones.existsByEventoIdAndCorreoIgnoreCase(evento.getId(), correoTexto)) {
			throw new ApiException(409, "Ya existe una inscripción registrada con ese correo electrónico en este evento.");
		}

		if (!docLimpio.isEmpty() && inscripciones.existsByEventoIdAndNumeroDocumentoIgnoreCase(evento.getId(), docLimpio)) {
			throw new ApiException(409, "Ya existe una inscripción registrada con ese número de documento en este evento.");
		}

		String codigo = esMasivo ? null : generarCodigo4Digitos(evento.getId());
		Inscripcion inscripcion = new Inscripcion();
		inscripcion.setCodigo(codigo);
		inscripcion.setEventoId(evento.getId());
		inscripcion.setNombre(nombre);
		inscripcion.setTipoDocumento(request.tipoDocumento() != null ? request.tipoDocumento() : "CC");
		inscripcion.setNumeroDocumento(docLimpio);
		inscripcion.setCorreo(correoTexto);
		inscripcion.setTelefono(request.telefono() == null ? "" : request.telefono().trim());
		inscripcion.setRelacionUniversidad(request.relacionUniversidad() != null ? request.relacionUniversidad() : "Externo");
		inscripcion.setProgramaAcademico(request.programaAcademico() == null ? "" : request.programaAcademico().trim());
		inscripcion.setEsMasivo(esMasivo);
		inscripcion.setAsistencia("Pendiente");
		inscripciones.save(inscripcion);

		evento.setInscritos(inscritos + 1);
		eventos.save(evento);

		if (!esMasivo && codigo != null) {
			String qrBase64 = qr.generarQrBase64(codigo, 300);
			correo.enviarHtml(inscripcion.getCorreo(), "¡Inscripción confirmada! - Observatorio ITM",
					correo.plantillas().correoConfirmacionInscripcion(
							inscripcion.getNombre(), evento.getTitulo(),
							evento.getFecha().format(FECHA_ES), evento.getHora(), evento.getLugar(),
							inscripcion.getCodigo(), qrBase64));
		}

		return aRespuesta(inscripcion);
	}

	private Inscripcion buscarPorTermino(String termino, Long eventoId) {
		String limpio = (termino == null ? "" : termino).trim();
		if (limpio.isEmpty()) {
			throw new ApiException(400, "Ingresa el código, documento o correo del participante.");
		}

		// 1. Si se especificó eventoId, buscar primero en ese evento
		if (eventoId != null) {
			var enEvento = inscripciones.findFirstByEventoIdAndCodigoIgnoreCase(eventoId, limpio)
					.or(() -> inscripciones.findFirstByEventoIdAndNumeroDocumentoIgnoreCase(eventoId, limpio))
					.or(() -> inscripciones.findFirstByEventoIdAndCorreoIgnoreCase(eventoId, limpio));
			if (enEvento.isPresent()) {
				return enEvento.get();
			}

			// Si no está en este evento, verificar si está registrado en otro evento
			var enOtro = inscripciones.findByCodigoIgnoreCase(limpio)
					.or(() -> inscripciones.findFirstByNumeroDocumentoIgnoreCase(limpio))
					.or(() -> inscripciones.findFirstByCorreoIgnoreCase(limpio));
			if (enOtro.isPresent()) {
				Evento otroEv = eventos.findById(enOtro.get().getEventoId()).orElse(null);
				String nombreOtro = otroEv != null ? otroEv.getTitulo() : "otro evento";
				throw new ApiException(400, "El participante está inscrito en otro evento (\"" + nombreOtro + "\"), no en el evento seleccionado.");
			}

			throw new ApiException(404, "Registro no encontrado. Verifica el código de 4 dígitos, documento o correo.");
		}

		// 2. Búsqueda global (sin filtro de evento)
		return inscripciones.findByCodigoIgnoreCase(limpio)
				.or(() -> inscripciones.findFirstByNumeroDocumentoIgnoreCase(limpio))
				.or(() -> inscripciones.findFirstByCorreoIgnoreCase(limpio))
				.orElseThrow(() -> new ApiException(404, "Registro no encontrado. Verifica el código de 4 dígitos, documento o correo."));
	}

	public ValidacionResponse validarCodigo(String termino, Long eventoId) {
		Inscripcion inscripcion = buscarPorTermino(termino, eventoId);

		Evento evento = eventos.findById(inscripcion.getEventoId())
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));

		return new ValidacionResponse(
				inscripcion.getId(),
				inscripcion.getCodigo(),
				inscripcion.getNombre(),
				inscripcion.getTipoDocumento(),
				inscripcion.getNumeroDocumento(),
				inscripcion.getCorreo(),
				inscripcion.getTelefono(),
				inscripcion.getRelacionUniversidad(),
				inscripcion.getProgramaAcademico(),
				inscripcion.getEsMasivo(),
				inscripcion.getAsistencia(),
				inscripcion.getEventoId(),
				evento.getTitulo(),
				evento.getFecha().format(FECHA_ES),
				evento.getHora(),
				evento.getLugar());
	}

	public InscripcionResponse marcarAsistencia(String termino, Long eventoId) {
		Inscripcion inscripcion = buscarPorTermino(termino, eventoId);

		if ("Asistió".equals(inscripcion.getAsistencia())) {
			throw new ApiException(409, "Este registro ya fue validado anteriormente.");
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

	public List<InscripcionResponse> listarTodas() {
		return inscripciones.findAll().stream()
				.map(this::aRespuesta).toList();
	}

	public void enviarQrDocente(String codigoBuscado, Usuario docente) {
		Inscripcion inscripcion = inscripciones.findByCodigoIgnoreCase(codigoBuscado)
				.orElseThrow(() -> new ApiException(404, "Código de registro no encontrado."));

		Evento evento = eventos.findById(inscripcion.getEventoId())
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));

		if (inscripcion.getCodigo() != null) {
			String qrBase64 = qr.generarQrBase64(inscripcion.getCodigo(), 300);
			correo.enviarHtml(docente.getCorreo(), "Código de control del participante - Observatorio ITM",
					correo.plantillas().correoQrDocente(docente.getNombre(), evento.getTitulo(),
							inscripcion.getNombre(), inscripcion.getCodigo(), qrBase64));
		}
	}
}