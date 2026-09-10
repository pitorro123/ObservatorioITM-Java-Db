package com.observatorio.backend.repositorios;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.observatorio.backend.modelos.Feedback;

public interface IFeedbackRepositorio extends JpaRepository<Feedback, Long> {

	List<Feedback> findByEventoIdOrderByFechaDesc(Long eventoId);

	boolean existsByEventoIdAndNombreIgnoreCase(Long eventoId, String nombre);
}