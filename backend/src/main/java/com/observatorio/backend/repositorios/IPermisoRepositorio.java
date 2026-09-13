package com.observatorio.backend.repositorios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.observatorio.backend.modelos.Permiso;

@Repository
public interface IPermisoRepositorio extends JpaRepository<Permiso, Long> {

	Optional<Permiso> findFirstByNombreIgnoreCase(String nombre);
}

