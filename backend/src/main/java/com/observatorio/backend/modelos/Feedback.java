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
@Table(name = "feedback")
@Getter
@Setter
@NoArgsConstructor
public class Feedback {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private Long eventoId;

	@Column(nullable = false)
	private String nombre;

	@Column(nullable = false)
	private Integer calificacion;

	@Column(length = 2000)
	private String comentario;

	private Instant fecha;

	@PrePersist
	void prePersist() {
		if (fecha == null) {
			fecha = Instant.now();
		}
	}
}