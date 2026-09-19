package com.observatorio.backend.servicios;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.observatorio.backend.dtos.inscripcion.InscripcionRequest;
import com.observatorio.backend.dtos.inscripcion.InscripcionResponse;
import com.observatorio.backend.dtos.inscripcion.ValidacionResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Asistencia;
import com.observatorio.backend.modelos.Evento;
import com.observatorio.backend.modelos.Inscripcion;
import com.observatorio.backend.modelos.Participante;
import com.observatorio.backend.modelos.ProgramaAcademico;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IAsistenciaRepositorio;
import com.observatorio.backend.repositorios.IEventoRepositorio;
import com.observatorio.backend.repositorios.IInscripcionRepositorio;
import com.observatorio.backend.repositorios.IParticipanteRepositorio;
import com.observatorio.backend.repositorios.IProgramaAcademicoRepositorio;

@Service
public class InscripcionServicio {

	private static final DateTimeFormatter FECHA_ES =
			DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", new Locale("es", "CO"));

	private final IInscripcionRepositorio inscripciones;
	private final IEventoRepositorio eventos;
	private final IParticipanteRepositorio participantes;
	private final IProgramaAcademicoRepositorio programas;
	private final IAsistenciaRepositorio asistencias;
	private final CorreoServicio correo;
	private final QrServicio qr;

	public InscripcionServicio(
			IInscripcionRepositorio inscripciones,
			IEventoRepositorio eventos,
			IParticipanteRepositorio participantes,
			IProgramaAcademicoRepositorio programas,
			IAsistenciaRepositorio asistencias,
			CorreoServicio correo,
			QrServicio qr) {
		this.inscripciones = inscripciones;
		this.eventos = eventos;
		this.participantes = participantes;
		this.programas = programas;
		this.asistencias = asistencias;
		this.correo = correo;
		this.qr = qr;
	}

	private InscripcionResponse aRespuesta(Inscripcion inscripcion) {
		Participante part = inscripcion.getParticipante();
		Asistencia asist = inscripcion.getAsistenciaRegistro();
		if (asist == null && inscripcion.getId() != null) {
			asist = asistencias.findByInscripcionId(inscripcion.getId()).orElse(null);
		}

		String nombres = part != null ? part.getNombres() : "";
		String apellidos = part != null ? part.getApellidos() : "";
		String nombreCompleto = inscripcion.getNombre();
		Long programaId = part != null && part.getProgramaAcademico() != null ? part.getProgramaAcademico().getId() : null;
		String estadoAsistencia = asist != null ? "Asistió" : inscripcion.getAsistencia();
		Instant fechaHoraAsistencia = asist != null ? asist.getFechaHoraAsistencia() : null;

		return new InscripcionResponse(
				inscripcion.getId(),
				inscripcion.getCodigo(),
				inscripcion.getEventoId(),
				nombreCompleto,
				nombres,
				apellidos,
				inscripcion.getTipoDocumento(),
				inscripcion.getNumeroDocumento(),
				inscripcion.getCorreo(),
				inscripcion.getTelefono(),
				inscripcion.getRelacionUniversidad(),
				inscripcion.getProgramaAcademico(),
				programaId,
				inscripcion.getEsMasivo(),
				estadoAsistencia,
				fechaHoraAsistencia,
				inscripcion.getFechaInscripcion(),
				inscripcion.getEsVegetariano(),
				inscripcion.getAlergiasAlimentos(),
				inscripcion.getEps(),
				inscripcion.getTipoVehiculo(),
				inscripcion.getPlacaVehiculo());
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

		// Extracción de datos del participante
		String docLimpio = (request.numeroDocumento() == null ? "" : request.numeroDocumento()).trim();
		String correoTexto = (request.correo() == null ? "" : request.correo()).trim().toLowerCase();

		String nombres = (request.nombres() == null ? "" : request.nombres()).trim();
		String apellidos = (request.apellidos() == null ? "" : request.apellidos()).trim();

		// Si vienen en el formato anterior (campo nombre único)
		if (nombres.isEmpty() && request.nombre() != null && !request.nombre().isBlank()) {
			String[] partes = request.nombre().trim().split("\\s+");
			if (partes.length == 1) {
				nombres = partes[0];
				apellidos = "";
			} else if (partes.length == 2) {
				nombres = partes[0];
				apellidos = partes[1];
			} else {
				nombres = partes[0] + " " + partes[1];
				StringBuilder sb = new StringBuilder();
				for (int i = 2; i < partes.length; i++) {
					if (!sb.isEmpty()) sb.append(" ");
					sb.append(partes[i]);
				}
				apellidos = sb.toString();
			}
		}

		if (nombres.isEmpty() || !correoTexto.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
			throw new ApiException(400, "Ingresa tu nombre y un correo electrónico válido.");
		}

		if (inscripciones.existsByEventoIdAndCorreoIgnoreCase(evento.getId(), correoTexto)) {
			throw new ApiException(409, "Ya existe una inscripción registrada con ese correo electrónico en este evento.");
		}

		if (!docLimpio.isEmpty() && inscripciones.existsByEventoIdAndNumeroDocumentoIgnoreCase(evento.getId(), docLimpio)) {
			throw new ApiException(409, "Ya existe una inscripción registrada con ese número de documento en este evento.");
		}

		// 1. Resolver Programa Académico (3FN)
		ProgramaAcademico programa = null;
		if (request.programaId() != null) {
			programa = programas.findById(request.programaId()).orElse(null);
		}
		if (programa == null && request.programaAcademico() != null && !request.programaAcademico().isBlank()) {
			String nombreProg = request.programaAcademico().trim();
			programa = programas.findFirstByNombreIgnoreCase(nombreProg)
					.orElseGet(() -> programas.save(new ProgramaAcademico(nombreProg)));
		}

		// 2. Normalización de Participante (3FN)
		Participante participante = null;
		if (!docLimpio.isEmpty()) {
			participante = participantes.findFirstByNumeroDocumentoIgnoreCase(docLimpio).orElse(null);
		}
		if (participante == null && !correoTexto.isEmpty()) {
			participante = participantes.findFirstByCorreoIgnoreCase(correoTexto).orElse(null);
		}

		if (participante == null) {
			participante = new Participante();
			participante.setFechaCreacion(Instant.now());
		}

		participante.setNombres(nombres);
		participante.setApellidos(apellidos.isEmpty() ? nombres : apellidos);
		participante.setTipoDocumento(request.tipoDocumento() != null ? request.tipoDocumento() : "CC");
		participante.setNumeroDocumento(docLimpio.isEmpty() ? "ND-" + System.currentTimeMillis() : docLimpio);
		participante.setCorreo(correoTexto);
		participante.setTelefono(request.telefono() == null ? "" : request.telefono().trim());
		participante.setRelacionUniversidad(request.relacionUniversidad() != null ? request.relacionUniversidad() : "Externo");
		participante.setProgramaAcademico(programa);
		participante = participantes.save(participante);

		// 3. Crear Inscripción (3FN: Tabla asociativa Evento <-> Participante)
		boolean esNasa = "nasa".equalsIgnoreCase(evento.getTipo());
		boolean debeGenerarCodigo = !esMasivo || esNasa;
		String codigo = debeGenerarCodigo ? generarCodigo4Digitos(evento.getId()) : null;
		Inscripcion inscripcion = new Inscripcion();
		inscripcion.setCodigo(codigo);
		inscripcion.setEventoId(evento.getId());
		inscripcion.setParticipante(participante);
		inscripcion.setEsMasivo(esMasivo);
		inscripcion.setAsistencia(esMasivo && !esNasa ? "Asistió" : "Pendiente");

		// Sincronización en columnas legacy para seguridad y compatibilidad
		inscripcion.setNombre(participante.getNombreCompleto());
		inscripcion.setTipoDocumento(participante.getTipoDocumento());
		inscripcion.setNumeroDocumento(participante.getNumeroDocumento());
		inscripcion.setCorreo(participante.getCorreo());
		inscripcion.setTelefono(participante.getTelefono());
		inscripcion.setRelacionUniversidad(participante.getRelacionUniversidad());
		if (programa != null) {
			inscripcion.setProgramaAcademico(programa.getNombre());
		}

		// Datos logísticos (alimentación, salud y parqueadero)
		inscripcion.setEsVegetariano(Boolean.TRUE.equals(request.esVegetariano()));
		inscripcion.setAlergiasAlimentos(request.alergiasAlimentos() != null ? request.alergiasAlimentos().trim() : null);
		inscripcion.setEps(request.eps() != null ? request.eps().trim() : null);
		inscripcion.setTipoVehiculo(request.tipoVehiculo() != null ? request.tipoVehiculo().trim() : null);
		inscripcion.setPlacaVehiculo(request.placaVehiculo() != null ? request.placaVehiculo().trim().toUpperCase() : null);

		inscripcion = inscripciones.save(inscripcion);

		if (esMasivo && !esNasa) {
			Asistencia asistencia = new Asistencia(inscripcion);
			asistencia = asistencias.save(asistencia);
			inscripcion.setAsistenciaRegistro(asistencia);
			evento.setAsistentes((evento.getAsistentes() == null ? 0 : evento.getAsistentes()) + 1);
		}

		evento.setInscritos(inscritos + 1);
		eventos.save(evento);

		if (codigo != null) {
			String qrBase64 = qr.generarQrBase64(codigo, 300);
			correo.enviarHtmlAsync(inscripcion.getCorreo(), "¡Inscripción confirmada! - Observatorio ITM",
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

		if (eventoId != null) {
			var enEvento = inscripciones.findFirstByEventoIdAndCodigoIgnoreCase(eventoId, limpio)
					.or(() -> inscripciones.findFirstByEventoIdAndNumeroDocumentoIgnoreCase(eventoId, limpio))
					.or(() -> inscripciones.findFirstByEventoIdAndCorreoIgnoreCase(eventoId, limpio));
			if (enEvento.isPresent()) {
				return enEvento.get();
			}

			try {
				Long idNum = Long.parseLong(limpio);
				var porId = inscripciones.findById(idNum);
				if (porId.isPresent() && porId.get().getEventoId().equals(eventoId)) {
					return porId.get();
				}
			} catch (NumberFormatException ignored) {
			}

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

		try {
			Long idNum = Long.parseLong(limpio);
			var porId = inscripciones.findById(idNum);
			if (porId.isPresent()) {
				return porId.get();
			}
		} catch (NumberFormatException ignored) {
		}

		return inscripciones.findByCodigoIgnoreCase(limpio)
				.or(() -> inscripciones.findFirstByNumeroDocumentoIgnoreCase(limpio))
				.or(() -> inscripciones.findFirstByCorreoIgnoreCase(limpio))
				.orElseThrow(() -> new ApiException(404, "Registro no encontrado. Verifica el código de 4 dígitos, documento o correo."));
	}

	public ValidacionResponse validarCodigo(String termino, Long eventoId) {
		Inscripcion inscripcion = buscarPorTermino(termino, eventoId);

		Evento evento = eventos.findById(inscripcion.getEventoId())
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));

		Asistencia asist = asistencias.findByInscripcionId(inscripcion.getId()).orElse(null);
		String estadoAsistencia = asist != null ? "Asistió" : inscripcion.getAsistencia();
		Instant fechaHoraAsistencia = asist != null ? asist.getFechaHoraAsistencia() : null;

		Participante part = inscripcion.getParticipante();
		String nombres = part != null ? part.getNombres() : "";
		String apellidos = part != null ? part.getApellidos() : "";

		return new ValidacionResponse(
				inscripcion.getId(),
				inscripcion.getCodigo(),
				inscripcion.getNombre(),
				nombres,
				apellidos,
				inscripcion.getTipoDocumento(),
				inscripcion.getNumeroDocumento(),
				inscripcion.getCorreo(),
				inscripcion.getTelefono(),
				inscripcion.getRelacionUniversidad(),
				inscripcion.getProgramaAcademico(),
				inscripcion.getEsMasivo(),
				estadoAsistencia,
				fechaHoraAsistencia,
				inscripcion.getEventoId(),
				evento.getTitulo(),
				evento.getFecha().format(FECHA_ES),
				evento.getHora(),
				evento.getLugar());
	}

	public InscripcionResponse marcarAsistencia(String termino, Long eventoId) {
		Inscripcion inscripcion = buscarPorTermino(termino, eventoId);

		if (asistencias.existsByInscripcionId(inscripcion.getId()) || "Asistió".equals(inscripcion.getAsistencia())) {
			throw new ApiException(409, "Este registro ya fue validado anteriormente.");
		}

		// Crear registro normalizado en tabla Asistencia (3FN)
		Asistencia asistencia = new Asistencia(inscripcion);
		asistencia = asistencias.save(asistencia);

		inscripcion.setAsistencia("Asistió");
		inscripcion.setAsistenciaRegistro(asistencia);
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
			correo.enviarHtmlAsync(docente.getCorreo(), "Código de control del participante - Observatorio ITM",
					correo.plantillas().correoQrDocente(docente.getNombre(), evento.getTitulo(),
							inscripcion.getNombre(), inscripcion.getCodigo(), qrBase64));
		}
	}
}