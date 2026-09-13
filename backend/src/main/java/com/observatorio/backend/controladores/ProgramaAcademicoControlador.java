package com.observatorio.backend.controladores;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.observatorio.backend.dtos.programa.ProgramaResponse;
import com.observatorio.backend.repositorios.IProgramaAcademicoRepositorio;

@RestController
@RequestMapping("/api/programas")
public class ProgramaAcademicoControlador {

	private final IProgramaAcademicoRepositorio programaRepositorio;

	public ProgramaAcademicoControlador(IProgramaAcademicoRepositorio programaRepositorio) {
		this.programaRepositorio = programaRepositorio;
	}

	@GetMapping
	public List<ProgramaResponse> listarProgramas() {
		return programaRepositorio.findAllByOrderByNombreAsc().stream()
				.map(p -> new ProgramaResponse(p.getId(), p.getNombre()))
				.toList();
	}
}

