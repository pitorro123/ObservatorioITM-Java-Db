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
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String nombre;

	@Column(nullable = false, unique = true)
	private String correo;

	@Column(nullable = false)
	private String password;

	@Column(nullable = false)
	private String rol; // Administrador | Docente

	@Column(nullable = false)
	private String estado; // Activo | Pendiente

	private String passwordTemporal;

	@Column(length = 500)
	private String token; // token de activacion / recuperacion

	@Column(length = 500)
	private String loginToken; // token de sesion

	private Instant fechaCreacion;

	@PrePersist
	void prePersist() {
		if (fechaCreacion == null) {
			fechaCreacion = Instant.now();
		}
	}
}