package com.observatorio.backend.modelos;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "asistencias")
@Getter
@Setter
@NoArgsConstructor
public class Asistencia {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(optional = false)
	@JoinColumn(name = "inscripcion_id", unique = true, nullable = false)
	private Inscripcion inscripcion;

	@Column(nullable = false)
	private Instant fechaHoraAsistencia;

	public Asistencia(Inscripcion inscripcion) {
		this.inscripcion = inscripcion;
		this.fechaHoraAsistencia = Instant.now();
	}

	@PrePersist
	void prePersist() {
		if (fechaHoraAsistencia == null) {
			fechaHoraAsistencia = Instant.now();
		}
	}
}

