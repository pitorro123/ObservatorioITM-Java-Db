package com.observatorio.backend.modelos;

import java.time.Instant;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
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

	@Column(name = "evento_id", nullable = false)
	private Long eventoId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "evento_id", insertable = false, updatable = false)
	private Evento evento;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "participante_id")
	private Participante participante;

	@OneToOne(mappedBy = "inscripcion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private Asistencia asistenciaRegistro;

	// Columnas de compatibilidad histórica / fallback
	private String nombre;

	private String tipoDocumento;

	private String numeroDocumento;

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

	public String getNombre() {
		if (participante != null) {
			return participante.getNombreCompleto();
		}
		return nombre != null ? nombre : "";
	}

	public String getCorreo() {
		if (participante != null && participante.getCorreo() != null) {
			return participante.getCorreo();
		}
		return correo != null ? correo : "";
	}

	public String getNumeroDocumento() {
		if (participante != null && participante.getNumeroDocumento() != null) {
			return participante.getNumeroDocumento();
		}
		return numeroDocumento != null ? numeroDocumento : "";
	}

	public String getTipoDocumento() {
		if (participante != null && participante.getTipoDocumento() != null) {
			return participante.getTipoDocumento();
		}
		return tipoDocumento != null ? tipoDocumento : "CC";
	}

	public String getTelefono() {
		if (participante != null && participante.getTelefono() != null) {
			return participante.getTelefono();
		}
		return telefono != null ? telefono : "";
	}

	public String getRelacionUniversidad() {
		if (participante != null && participante.getRelacionUniversidad() != null) {
			return participante.getRelacionUniversidad();
		}
		return relacionUniversidad != null ? relacionUniversidad : "Externo";
	}

	public String getProgramaAcademico() {
		if (participante != null && participante.getProgramaAcademico() != null) {
			return participante.getProgramaAcademico().getNombre();
		}
		return programaAcademico != null ? programaAcademico : "";
	}

	public String getAsistencia() {
		if (asistenciaRegistro != null) {
			return "Asistió";
		}
		return asistencia != null ? asistencia : "Pendiente";
	}
}