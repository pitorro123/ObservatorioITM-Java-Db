package com.observatorio.backend.modelos;

import java.time.Instant;
import java.time.LocalDate;

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
@Table(name = "eventos")
@Getter
@Setter
@NoArgsConstructor
public class Evento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String titulo;

	@Column(nullable = false, length = 2000)
	private String descripcion;

	@Column(nullable = false)
	private LocalDate fecha;

	@Column(nullable = false)
	private String hora;

	@Column(nullable = false)
	private String lugar;

	private String imagen;

	@Column(nullable = false)
	private String estado; // borrador | publicado | cancelado

	@Column(nullable = false)
	private String tipo; // abierto | semillero

	private Integer inscritos;

	private Integer asistentes;

	private Instant fechaCreacion;

	@PrePersist
	void prePersist() {
		if (inscritos == null) {
			inscritos = 0;
		}
		if (asistentes == null) {
			asistentes = 0;
		}
		if (fechaCreacion == null) {
			fechaCreacion = Instant.now();
		}
	}
}