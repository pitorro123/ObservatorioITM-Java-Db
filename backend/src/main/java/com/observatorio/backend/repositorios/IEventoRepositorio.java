package com.observatorio.backend.repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.observatorio.backend.modelos.Evento;

public interface IEventoRepositorio extends JpaRepository<Evento, Long> {

	List<Evento> findByEstadoOrderByFechaAsc(String estado);

	List<Evento> findByIdInOrderByFechaAsc(java.util.Collection<Long> ids);
}