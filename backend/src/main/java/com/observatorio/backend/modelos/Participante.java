package com.observatorio.backend.modelos;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "participantes")
@Getter
@Setter
@NoArgsConstructor
public class Participante {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 100)
	private String nombres;

	@Column(nullable = false, length = 100)
	private String apellidos;

	@Column(length = 20)
	private String tipoDocumento;

	@Column(nullable = false, length = 50)
	private String numeroDocumento;

	@Column(nullable = false, length = 150)
	private String correo;

	@Column(length = 30)
	private String telefono;

	@Column(length = 50)
	private String relacionUniversidad; // Estudiante | Docente | Egresado | Externo | Otro

	@ManyToOne
	@JoinColumn(name = "programa_id")
	private ProgramaAcademico programaAcademico;

	private Instant fechaCreacion;

	@PrePersist
	void prePersist() {
		if (fechaCreacion == null) {
			fechaCreacion = Instant.now();
		}
	}

	public String getNombreCompleto() {
		String n = nombres != null ? nombres.trim() : "";
		String a = apellidos != null ? apellidos.trim() : "";
		if (n.isEmpty()) return a;
		if (a.isEmpty()) return n;
		return n + " " + a;
	}
}

