package com.observatorio.backend.controladores;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthControlador {

	@GetMapping
	public Map<String, Object> health() {
		return Map.of(
			"status", "UP",
			"timestamp", System.currentTimeMillis()
		);
	}
}

