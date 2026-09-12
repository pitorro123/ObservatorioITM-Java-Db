package com.observatorio.backend.controladores;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.observatorio.backend.dtos.usuario.CrearDocenteRequest;
import com.observatorio.backend.dtos.usuario.CrearDocenteResponse;
import com.observatorio.backend.dtos.usuario.PerfilRequest;
import com.observatorio.backend.dtos.usuario.UsuarioResponse;
import com.observatorio.backend.servicios.SeguridadServicio;
import com.observatorio.backend.servicios.UsuarioServicio;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioControlador {

	private final UsuarioServicio servicio;
	private final SeguridadServicio seguridad;

	public UsuarioControlador(UsuarioServicio servicio, SeguridadServicio seguridad) {
		this.servicio = servicio;
		this.seguridad = seguridad;
	}

	@GetMapping("/docentes")
	public List<UsuarioResponse> listarDocentes() {
		seguridad.exigirAdministrador();
		return servicio.listarDocentes();
	}

	@PostMapping("/docentes")
	public CrearDocenteResponse crearDocente(@RequestBody CrearDocenteRequest request) {
		seguridad.exigirAdministrador();
		return servicio.crearDocente(request);
	}

	@PutMapping("/docentes/{id}")
	public UsuarioResponse editarDocente(@PathVariable Long id, @RequestBody CrearDocenteRequest request) {
		seguridad.exigirAdministrador();
		return servicio.editarDocente(id, request);
	}

	@DeleteMapping("/docentes/{id}")
	public Map<String, Object> eliminarDocente(@PathVariable Long id) {
		seguridad.exigirAdministrador();
		servicio.eliminarDocente(id);
		return Map.of("exito", true);
	}

	@org.springframework.web.bind.annotation.PatchMapping("/docentes/{id}/estado")
	public UsuarioResponse cambiarEstadoDocentePatch(@PathVariable Long id, @RequestBody Map<String, String> body) {
		seguridad.exigirAdministrador();
		return servicio.cambiarEstadoDocente(id, body.get("estado"));
	}

	@PutMapping("/docentes/{id}/estado")
	public UsuarioResponse cambiarEstadoDocentePut(@PathVariable Long id, @RequestBody Map<String, String> body) {
		seguridad.exigirAdministrador();
		return servicio.cambiarEstadoDocente(id, body.get("estado"));
	}

	@PutMapping("/perfil")
	public UsuarioResponse actualizarPerfil(@RequestBody PerfilRequest request) {
		return servicio.actualizarPerfil(seguridad.usuarioActual(), request);
	}
}