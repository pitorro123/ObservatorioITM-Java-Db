package com.observatorio.backend.dtos.usuario;

public record CrearDocenteResponse(
		Long id,
		String nombre,
		String correo,
		String rol,
		String estado,
		String passwordTemporal,
		String enlace) {
}