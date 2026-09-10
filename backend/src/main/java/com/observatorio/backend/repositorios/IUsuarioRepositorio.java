package com.observatorio.backend.repositorios;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.observatorio.backend.modelos.Usuario;

public interface IUsuarioRepositorio extends JpaRepository<Usuario, Long> {

	Optional<Usuario> findByCorreoIgnoreCase(String correo);

	Optional<Usuario> findByToken(String token);

	Optional<Usuario> findByLoginToken(String loginToken);

	List<Usuario> findByRol(String rol);
}