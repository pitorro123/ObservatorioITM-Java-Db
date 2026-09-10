package com.observatorio.backend.servicios;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.observatorio.backend.dtos.contenido.ObservatorioRequest;
import com.observatorio.backend.dtos.contenido.SemilleroRequest;
import com.observatorio.backend.modelos.Contenido;
import com.observatorio.backend.repositorios.IContenidoRepositorio;

@Service
public class ContenidoServicio {

	private static final String CLAVE_SEMILLERO = "semillero";
	private static final String CLAVE_OBSERVATORIO = "observatorio";

	private final IContenidoRepositorio repositorio;
	private final ObjectMapper objectMapper;

	public ContenidoServicio(IContenidoRepositorio repositorio, ObjectMapper objectMapper) {
		this.repositorio = repositorio;
		this.objectMapper = objectMapper;
	}

	private Contenido buscarOCrear(String clave) {
		return repositorio.findByClave(clave).orElseGet(() -> {
			Contenido nuevo = new Contenido();
			nuevo.setClave(clave);
			return nuevo;
		});
	}

	private Map<String, Object> aMapa(Contenido contenido) {
		if (contenido.getValor() == null || contenido.getValor().isBlank()) {
			return new LinkedHashMap<>();
		}
		try {
			return objectMapper.readValue(contenido.getValor(),
					objectMapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
		} catch (JsonProcessingException e) {
			return new LinkedHashMap<>();
		}
	}

	private Map<String, Object> guardar(String clave, Map<String, Object> datos) {
		for (Map.Entry<String, Object> entrada : datos.entrySet()) {
			if (entrada.getValue() instanceof String texto) {
				if (texto.isBlank()) {
					throw new com.observatorio.backend.excepciones.ApiException(400,
							"Completa todos los campos del contenido.");
				}
			}
		}
		Contenido contenido = buscarOCrear(clave);
		try {
			contenido.setValor(objectMapper.writeValueAsString(datos));
		} catch (JsonProcessingException e) {
			throw new com.observatorio.backend.excepciones.ApiException(500, "No se pudo guardar el contenido.");
		}
		contenido.setActualizadoEn(Instant.now());
		repositorio.save(contenido);
		return datos;
	}

	public Map<String, Object> obtenerSemillero() {
		return aMapa(buscarOCrear(CLAVE_SEMILLERO));
	}

	public Map<String, Object> obtenerObservatorio() {
		return aMapa(buscarOCrear(CLAVE_OBSERVATORIO));
	}

	public Map<String, Object> guardarSemillero(SemilleroRequest request) {
		Map<String, Object> datos = new LinkedHashMap<>();
		datos.put("titulo", request.titulo());
		datos.put("descripcion", request.descripcion());
		datos.put("objetivos", request.objetivos() == null ? java.util.List.of() : request.objetivos());
		datos.put("comoParticipar", request.comoParticipar());
		return guardar(CLAVE_SEMILLERO, datos);
	}

	public Map<String, Object> guardarObservatorio(ObservatorioRequest request) {
		Map<String, Object> datos = new LinkedHashMap<>();
		datos.put("titulo", request.titulo());
		datos.put("descripcion", request.descripcion());
		datos.put("trayectoria", request.trayectoria() == null ? java.util.List.of() : request.trayectoria());
		datos.put("mision", request.mision());
		datos.put("vision", request.vision());
		return guardar(CLAVE_OBSERVATORIO, datos);
	}
}