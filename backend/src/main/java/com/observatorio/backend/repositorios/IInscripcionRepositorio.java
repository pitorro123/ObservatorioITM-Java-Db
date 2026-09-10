package com.observatorio.backend.repositorios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.observatorio.backend.modelos.Inscripcion;

public interface IInscripcionRepositorio extends JpaRepository<Inscripcion, Long> {

	Optional<Inscripcion> findByCodigoIgnoreCase(String codigo);

	List<Inscripcion> findByEventoIdOrderByFechaInscripcionAsc(Long eventoId);

	boolean existsByEventoIdAndCorreoIgnoreCase(Long eventoId, String correo);
}