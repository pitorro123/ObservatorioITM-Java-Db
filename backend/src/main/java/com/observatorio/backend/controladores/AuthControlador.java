package com.observatorio.backend.controladores;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.observatorio.backend.dtos.auth.LoginRequest;
import com.observatorio.backend.dtos.auth.LoginResponse;
import com.observatorio.backend.dtos.auth.PasswordChangeRequest;
import com.observatorio.backend.dtos.auth.RecuperarRequest;
import com.observatorio.backend.dtos.usuario.UsuarioResponse;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.servicios.AuthServicio;
import com.observatorio.backend.servicios.SeguridadServicio;

@RestController
@RequestMapping("/api/auth")
public class AuthControlador {

	private final AuthServicio auth;
	private final SeguridadServicio seguridad;

	public AuthControlador(AuthServicio auth, SeguridadServicio seguridad) {
		this.auth = auth;
		this.seguridad = seguridad;
	}

	@PostMapping("/login")
	public LoginResponse login(@RequestBody LoginRequest request) {
		return auth.login(request);
	}

	@PostMapping("/logout")
	public Map<String, Object> logout() {
		auth.logout(seguridad.usuarioActual());
		return Map.of("exito", true);
	}

	@GetMapping("/usuario")
	public UsuarioResponse usuarioActual() {
		Usuario usuario = seguridad.usuarioActual();
		return new UsuarioResponse(usuario.getId(), usuario.getNombre(), usuario.getCorreo(),
				usuario.getRol(), usuario.getEstado());
	}

	@PostMapping("/recuperar")
	public Map<String, Object> recuperar(@RequestBody RecuperarRequest request) {
		auth.solicitarRecuperacion(request.correo());
		return Map.of("exito", true);
	}

	@PostMapping("/cambiar-password")
	public Map<String, Object> cambiarPassword(@RequestBody PasswordChangeRequest request) {
		Usuario usuario = auth.cambiarPassword(request.token(), request.nuevaPassword());
		return Map.of("exito", true, "nombre", usuario.getNombre());
	}
}