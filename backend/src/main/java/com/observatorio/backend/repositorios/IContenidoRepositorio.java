package com.observatorio.backend.repositorios;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.observatorio.backend.modelos.Contenido;

public interface IContenidoRepositorio extends JpaRepository<Contenido, Long> {

	Optional<Contenido> findByClave(String clave);
}