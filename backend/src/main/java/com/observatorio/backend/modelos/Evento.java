package com.observatorio.backend.modelos;

import java.time.Instant;
import java.time.LocalDate;

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

	private String horaInicio;

	private String horaFin;

	@Column(nullable = false)
	private String lugar;

	private String direccion;

	private Double latitud;

	private Double longitud;

	private String imagen;

	@Column(nullable = false)
	private String estado; // borrador | publicado | cancelado

	@Column(nullable = false)
	private String tipo; // abierto | charla | observacion | semillero

	private Boolean esMasivo;

	private Integer capacidad;

	private String motivoCancelacion; // clima | personal

	@Column(length = 1000)
	private String ubicacionMapa;

	private Long creadoPorId;

	private String creadoPorNombre;

	private String creadoPorRol;

	@ManyToOne
	@JoinColumn(name = "creado_por_usuario_id")
	private Usuario creadoPorUsuario;

	private Integer inscritos;

	private Integer asistentes;

	private Instant fechaCreacion;

	@PrePersist
	void prePersist() {
		if (esMasivo == null) {
			esMasivo = false;
		}
		if (capacidad == null && !Boolean.TRUE.equals(esMasivo)) {
			capacidad = 50;
		}
		if (inscritos == null) {
			inscritos = 0;
		}
		if (asistentes == null) {
			asistentes = 0;
		}
		if (horaInicio == null && hora != null) {
			horaInicio = hora;
		}
		if (direccion == null && lugar != null) {
			direccion = lugar;
		}
		if (fechaCreacion == null) {
			fechaCreacion = Instant.now();
		}
	}
}