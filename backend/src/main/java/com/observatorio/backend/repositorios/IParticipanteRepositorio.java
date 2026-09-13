package com.observatorio.backend.repositorios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.observatorio.backend.modelos.Participante;

@Repository
public interface IParticipanteRepositorio extends JpaRepository<Participante, Long> {

	Optional<Participante> findFirstByNumeroDocumentoIgnoreCase(String numeroDocumento);

	Optional<Participante> findFirstByCorreoIgnoreCase(String correo);

	boolean existsByNumeroDocumentoIgnoreCase(String numeroDocumento);

	boolean existsByCorreoIgnoreCase(String correo);
}

