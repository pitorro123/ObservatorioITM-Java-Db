package com.observatorio.backend.repositorios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.observatorio.backend.modelos.Asistencia;

@Repository
public interface IAsistenciaRepositorio extends JpaRepository<Asistencia, Long> {

	Optional<Asistencia> findByInscripcionId(Long inscripcionId);

	boolean existsByInscripcionId(Long inscripcionId);
}

