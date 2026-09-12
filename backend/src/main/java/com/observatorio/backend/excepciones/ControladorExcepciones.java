package com.observatorio.backend.excepciones;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ControladorExcepciones {

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<Map<String, String>> manejarApi(ApiException ex) {
		HttpStatus estado = HttpStatus.resolve(ex.getEstado());
		if (estado == null) {
			estado = HttpStatus.INTERNAL_SERVER_ERROR;
		}
		return ResponseEntity.status(estado).body(Map.of("mensaje", ex.getMessage()));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, String>> manejarGeneral(Exception ex) {
		String detalle = ex.getMessage() != null ? ex.getMessage() : ex.getClass().getName();
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("mensaje", "Error del servidor: " + detalle));
	}
}