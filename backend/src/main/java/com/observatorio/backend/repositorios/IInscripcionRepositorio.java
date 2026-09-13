package com.observatorio.backend.repositorios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.observatorio.backend.modelos.Inscripcion;

public interface IInscripcionRepositorio extends JpaRepository<Inscripcion, Long> {

	Optional<Inscripcion> findByCodigoIgnoreCase(String codigo);

	boolean existsByCodigo(String codigo);

	List<Inscripcion> findByEventoIdOrderByFechaInscripcionAsc(Long eventoId);

	@Query("SELECT COUNT(i) > 0 FROM Inscripcion i WHERE i.eventoId = :eventoId AND " +
			"(LOWER(i.correo) = LOWER(:correo) OR (i.participante IS NOT NULL AND LOWER(i.participante.correo) = LOWER(:correo)))")
	boolean existsByEventoIdAndCorreoIgnoreCase(@Param("eventoId") Long eventoId, @Param("correo") String correo);

	@Query("SELECT COUNT(i) > 0 FROM Inscripcion i WHERE i.eventoId = :eventoId AND " +
			"(LOWER(i.numeroDocumento) = LOWER(:doc) OR (i.participante IS NOT NULL AND LOWER(i.participante.numeroDocumento) = LOWER(:doc)))")
	boolean existsByEventoIdAndNumeroDocumentoIgnoreCase(@Param("eventoId") Long eventoId, @Param("doc") String numeroDocumento);

	Optional<Inscripcion> findFirstByEventoIdAndCodigoIgnoreCase(Long eventoId, String codigo);

	@Query("SELECT i FROM Inscripcion i WHERE i.eventoId = :eventoId AND " +
			"(LOWER(i.numeroDocumento) = LOWER(:doc) OR (i.participante IS NOT NULL AND LOWER(i.participante.numeroDocumento) = LOWER(:doc)))")
	Optional<Inscripcion> findFirstByEventoIdAndNumeroDocumentoIgnoreCase(@Param("eventoId") Long eventoId, @Param("doc") String numeroDocumento);

	@Query("SELECT i FROM Inscripcion i WHERE i.eventoId = :eventoId AND " +
			"(LOWER(i.correo) = LOWER(:correo) OR (i.participante IS NOT NULL AND LOWER(i.participante.correo) = LOWER(:correo)))")
	Optional<Inscripcion> findFirstByEventoIdAndCorreoIgnoreCase(@Param("eventoId") Long eventoId, @Param("correo") String correo);

	@Query("SELECT i FROM Inscripcion i WHERE " +
			"LOWER(i.numeroDocumento) = LOWER(:doc) OR (i.participante IS NOT NULL AND LOWER(i.participante.numeroDocumento) = LOWER(:doc))")
	Optional<Inscripcion> findFirstByNumeroDocumentoIgnoreCase(@Param("doc") String numeroDocumento);

	@Query("SELECT i FROM Inscripcion i WHERE " +
			"LOWER(i.correo) = LOWER(:correo) OR (i.participante IS NOT NULL AND LOWER(i.participante.correo) = LOWER(:correo))")
	Optional<Inscripcion> findFirstByCorreoIgnoreCase(@Param("correo") String correo);
}