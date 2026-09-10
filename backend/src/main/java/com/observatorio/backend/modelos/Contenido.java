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
@Table(name = "contenidos")
@Getter
@Setter
@NoArgsConstructor
public class Contenido {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String clave; // semillero | observatorio

	@Column(nullable = false, length = 5000)
	private String valor; // JSON con el contenido

	private Instant actualizadoEn;

	@PrePersist
	void prePersist() {
		if (actualizadoEn == null) {
			actualizadoEn = Instant.now();
		}
	}
}