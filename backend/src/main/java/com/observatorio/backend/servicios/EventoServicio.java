package com.observatorio.backend.servicios;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.observatorio.backend.dtos.evento.EventoRequest;
import com.observatorio.backend.dtos.evento.EventoResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Evento;
import com.observatorio.backend.repositorios.IEventoRepositorio;

@Service
public class EventoServicio {

	private static final Set<String> ESTADOS_VALIDOS = Set.of("borrador", "publicado", "cancelado");

	private final IEventoRepositorio repositorio;

	public EventoServicio(IEventoRepositorio repositorio) {
		this.repositorio = repositorio;
	}

	private EventoResponse aRespuesta(Evento evento) {
		return new EventoResponse(
				evento.getId(),
				evento.getTitulo(),
				evento.getDescripcion(),
				evento.getFecha(),
				evento.getHora(),
				evento.getLugar(),
				evento.getImagen(),
				evento.getEstado(),
				evento.getTipo(),
				evento.getEsMasivo(),
				evento.getCapacidad(),
				evento.getUbicacionMapa(),
				evento.getCreadoPorId(),
				evento.getCreadoPorNombre(),
				evento.getCreadoPorRol(),
				evento.getMotivoCancelacion(),
				evento.getInscritos() == null ? 0 : evento.getInscritos(),
				evento.getAsistentes() == null ? 0 : evento.getAsistentes());
	}

	private LocalDate validarFecha(String fecha) {
		try {
			return LocalDate.parse(fecha);
		} catch (Exception e) {
			throw new ApiException(400, "La fecha no es válida.");
		}
	}

	public List<EventoResponse> listarTodos() {
		return repositorio.findAll().stream()
				.sorted(Comparator.comparing(Evento::getFecha))
				.map(this::aRespuesta).toList();
	}

	public List<EventoResponse> listarPublicados() {
		return repositorio.findByEstadoOrderByFechaAsc("publicado").stream()
				.map(this::aRespuesta).toList();
	}

	public EventoResponse obtener(Long id) {
		return aRespuesta(repositorio.findById(id)
				.orElseThrow(() -> new ApiException(404, "El evento no existe.")));
	}

	public EventoResponse obtenerPublico(Long id) {
		Evento evento = repositorio.findById(id)
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));
		if (!"publicado".equals(evento.getEstado())) {
			throw new ApiException(404, "El evento no existe.");
		}
		return aRespuesta(evento);
	}

	public EventoResponse crear(EventoRequest request) {
		if (request.titulo() == null || request.titulo().isBlank()
				|| request.descripcion() == null || request.descripcion().isBlank()
				|| request.fecha() == null || request.fecha().isBlank()
				|| request.hora() == null || request.hora().isBlank()
				|| request.lugar() == null || request.lugar().isBlank()) {
			throw new ApiException(400, "Completa todos los campos obligatorios del evento.");
		}

		Evento evento = new Evento();
		evento.setTitulo(request.titulo().trim());
		evento.setDescripcion(request.descripcion().trim());
		evento.setFecha(validarFecha(request.fecha()));
		evento.setHora(request.hora().trim());
		evento.setLugar(request.lugar().trim());
		evento.setImagen(request.imagen() == null || request.imagen().isBlank()
				? "/images/Imagen.png" : request.imagen().trim());
		evento.setEstado(request.estado() == null || request.estado().isBlank()
				? "borrador" : request.estado());
		evento.setTipo(request.tipo() == null || request.tipo().isBlank()
				? "abierto" : request.tipo());
		boolean esNasa = "nasa".equalsIgnoreCase(evento.getTipo());
		boolean esMasivo = esNasa || Boolean.TRUE.equals(request.esMasivo());
		evento.setEsMasivo(esMasivo);
		evento.setCapacidad(esMasivo ? null : (request.capacidad() != null && request.capacidad() > 0 ? request.capacidad() : 50));
		evento.setUbicacionMapa(request.ubicacionMapa() != null && !request.ubicacionMapa().isBlank()
				? request.ubicacionMapa().trim() : evento.getLugar());
		evento.setCreadoPorId(request.creadoPorId() != null ? request.creadoPorId() : 1L);
		evento.setCreadoPorNombre(request.creadoPorNombre() != null && !request.creadoPorNombre().isBlank()
				? request.creadoPorNombre().trim() : "Administrador");
		evento.setCreadoPorRol(request.creadoPorRol() != null && !request.creadoPorRol().isBlank()
				? request.creadoPorRol().trim() : "Docente");
		evento.setMotivoCancelacion(request.motivoCancelacion());
		evento.setInscritos(0);
		evento.setAsistentes(0);

		if (!ESTADOS_VALIDOS.contains(evento.getEstado())) {
			throw new ApiException(400, "El estado del evento no es válido.");
		}

		return aRespuesta(repositorio.save(evento));
	}

	public EventoResponse editar(Long id, EventoRequest request) {
		Evento evento = repositorio.findById(id)
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));

		if (request.titulo() != null && !request.titulo().isBlank()) evento.setTitulo(request.titulo().trim());
		if (request.descripcion() != null && !request.descripcion().isBlank()) evento.setDescripcion(request.descripcion().trim());
		if (request.fecha() != null && !request.fecha().isBlank()) evento.setFecha(validarFecha(request.fecha()));
		if (request.hora() != null && !request.hora().isBlank()) evento.setHora(request.hora().trim());
		if (request.lugar() != null && !request.lugar().isBlank()) evento.setLugar(request.lugar().trim());
		if (request.imagen() != null && !request.imagen().isBlank()) evento.setImagen(request.imagen().trim());
		if (request.tipo() != null && !request.tipo().isBlank()) evento.setTipo(request.tipo().trim());
		boolean esNasaEdicion = "nasa".equalsIgnoreCase(evento.getTipo());
		if (esNasaEdicion) {
			evento.setEsMasivo(true);
			evento.setCapacidad(null);
		} else if (request.esMasivo() != null) {
			evento.setEsMasivo(request.esMasivo());
			if (Boolean.TRUE.equals(request.esMasivo())) {
				evento.setCapacidad(null);
			}
		}
		if (!Boolean.TRUE.equals(evento.getEsMasivo()) && request.capacidad() != null) {
			evento.setCapacidad(request.capacidad() > 0 ? request.capacidad() : 50);
		}
		if (request.ubicacionMapa() != null) evento.setUbicacionMapa(request.ubicacionMapa().trim());
		if (request.creadoPorId() != null) evento.setCreadoPorId(request.creadoPorId());
		if (request.creadoPorNombre() != null) evento.setCreadoPorNombre(request.creadoPorNombre().trim());
		if (request.creadoPorRol() != null) evento.setCreadoPorRol(request.creadoPorRol().trim());
		if (request.motivoCancelacion() != null) evento.setMotivoCancelacion(request.motivoCancelacion().trim());
		if (request.estado() != null && !request.estado().isBlank()) {
			if (!ESTADOS_VALIDOS.contains(request.estado())) {
				throw new ApiException(400, "El estado del evento no es válido.");
			}
			evento.setEstado(request.estado());
		}

		return aRespuesta(repositorio.save(evento));
	}

	public void eliminar(Long id) {
		if (!repositorio.existsById(id)) {
			throw new ApiException(404, "El evento no existe.");
		}
		repositorio.deleteById(id);
	}

	public EventoResponse publicar(Long id) {
		Evento evento = repositorio.findById(id)
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));
		evento.setEstado("publicado");
		return aRespuesta(repositorio.save(evento));
	}

	public EventoResponse cancelar(Long id) {
		return cancelar(id, "clima");
	}

	public EventoResponse cancelar(Long id, String motivo) {
		Evento evento = repositorio.findById(id)
				.orElseThrow(() -> new ApiException(404, "El evento no existe."));
		evento.setEstado("cancelado");
		evento.setMotivoCancelacion(motivo != null && !motivo.isBlank() ? motivo.trim() : "clima");
		return aRespuesta(repositorio.save(evento));
	}
}