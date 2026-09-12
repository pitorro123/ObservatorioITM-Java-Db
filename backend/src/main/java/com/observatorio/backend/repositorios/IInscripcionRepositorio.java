package com.observatorio.backend.repositorios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.observatorio.backend.modelos.Inscripcion;

public interface IInscripcionRepositorio extends JpaRepository<Inscripcion, Long> {

	Optional<Inscripcion> findByCodigoIgnoreCase(String codigo);

	boolean existsByCodigo(String codigo);

	List<Inscripcion> findByEventoIdOrderByFechaInscripcionAsc(Long eventoId);

	boolean existsByEventoIdAndCorreoIgnoreCase(Long eventoId, String correo);

	boolean existsByEventoIdAndNumeroDocumentoIgnoreCase(Long eventoId, String numeroDocumento);

	Optional<Inscripcion> findFirstByEventoIdAndCodigoIgnoreCase(Long eventoId, String codigo);

	Optional<Inscripcion> findFirstByEventoIdAndNumeroDocumentoIgnoreCase(Long eventoId, String numeroDocumento);

	Optional<Inscripcion> findFirstByEventoIdAndCorreoIgnoreCase(Long eventoId, String correo);

	Optional<Inscripcion> findFirstByNumeroDocumentoIgnoreCase(String numeroDocumento);

	Optional<Inscripcion> findFirstByCorreoIgnoreCase(String correo);
}