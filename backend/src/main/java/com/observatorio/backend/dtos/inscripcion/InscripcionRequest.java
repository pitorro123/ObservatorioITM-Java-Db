package com.observatorio.backend.dtos.inscripcion;

public record InscripcionRequest(
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
		Boolean esVegetariano,
		String alergiasAlimentos,
		String eps,
		String tipoVehiculo,
		String placaVehiculo) {

	public InscripcionRequest(
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
			Long programaId) {
		this(eventoId, nombre, nombres, apellidos, tipoDocumento, numeroDocumento, correo, telefono, relacionUniversidad, programaAcademico, programaId, false, null, null, null, null);
	}
}