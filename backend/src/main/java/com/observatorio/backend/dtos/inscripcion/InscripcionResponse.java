package com.observatorio.backend.dtos.inscripcion;

import java.time.Instant;

public record InscripcionResponse(
		Long id,
		String codigo,
		Long eventoId,
		String nombre,
		String nombres,
		String apellidos,
		String tipoDocumento,
		String numeroDocumento,
		String correo,
		String telefono,
		String relacionUniversidad,
		String programaAcademico,
		Long programaId,
		Boolean esMasivo,
		String asistencia,
		Instant fechaHoraAsistencia,
		Instant fechaInscripcion,
		Boolean esVegetariano,
		String alergiasAlimentos,
		String eps,
		String tipoVehiculo,
		String placaVehiculo) {

	public InscripcionResponse(
			Long id,
			String codigo,
			Long eventoId,
			String nombre,
			String nombres,
			String apellidos,
			String tipoDocumento,
			String numeroDocumento,
			String correo,
			String telefono,
			String relacionUniversidad,
			String programaAcademico,
			Long programaId,
			Boolean esMasivo,
			String asistencia,
			Instant fechaHoraAsistencia,
			Instant fechaInscripcion) {
		this(id, codigo, eventoId, nombre, nombres, apellidos, tipoDocumento, numeroDocumento, correo, telefono, relacionUniversidad, programaAcademico, programaId, esMasivo, asistencia, fechaHoraAsistencia, fechaInscripcion, false, null, null, null, null);
	}
}