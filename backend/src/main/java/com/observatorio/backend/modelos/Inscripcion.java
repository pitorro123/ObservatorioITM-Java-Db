package com.observatorio.backend.modelos;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inscripciones")
@Getter
@Setter
@NoArgsConstructor
public class Inscripcion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(length = 40)
	private String codigo;

	@Column(nullable = false)
	private Long eventoId;

	@Column(nullable = false)
	private String nombre;

	private String tipoDocumento;

	private String numeroDocumento;

	@Column(nullable = false)
	private String correo;

	private String telefono;

	private String relacionUniversidad;

	private String programaAcademico;

	private Boolean esMasivo;

	@Column(nullable = false)
	private String asistencia; // Pendiente | Asistió

	private Instant fechaInscripcion;

	@PrePersist
	void prePersist() {
		if (asistencia == null) {
			asistencia = "Pendiente";
		}
		if (esMasivo == null) {
			esMasivo = false;
		}
		if (fechaInscripcion == null) {
			fechaInscripcion = Instant.now();
		}
	}
}