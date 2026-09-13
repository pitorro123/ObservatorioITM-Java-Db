package com.observatorio.backend.repositorios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.observatorio.backend.modelos.Rol;

@Repository
public interface IRolRepositorio extends JpaRepository<Rol, Long> {

	Optional<Rol> findFirstByNombreIgnoreCase(String nombre);

	Optional<Rol> findByNombre(String nombre);
}

