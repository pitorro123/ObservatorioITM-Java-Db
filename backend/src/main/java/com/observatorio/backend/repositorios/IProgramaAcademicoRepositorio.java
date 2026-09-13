package com.observatorio.backend.repositorios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.observatorio.backend.modelos.ProgramaAcademico;

@Repository
public interface IProgramaAcademicoRepositorio extends JpaRepository<ProgramaAcademico, Long> {

	Optional<ProgramaAcademico> findFirstByNombreIgnoreCase(String nombre);

	List<ProgramaAcademico> findAllByOrderByNombreAsc();
}

