package com.observatorio.backend.servicios;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.observatorio.backend.dtos.auth.LoginRequest;
import com.observatorio.backend.dtos.auth.LoginResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IUsuarioRepositorio;

@Service
public class AuthServicio {

	private final IUsuarioRepositorio repositorio;
	private final CorreoServicio correo;
	private final PasswordEncoder encoder;

	@Value("${app.public.base-url:http://localhost:5173}")
	private String baseUrl;

	public AuthServicio(IUsuarioRepositorio repositorio, CorreoServicio correo, PasswordEncoder encoder) {
		this.repositorio = repositorio;
		this.correo = correo;
		this.encoder = encoder;
	}

	public LoginResponse login(LoginRequest request) {
		Usuario usuario = repositorio.findByCorreoIgnoreCase(request.correo().trim())
				.orElseThrow(() -> new ApiException(404, "No existe una cuenta con ese correo."));

		if (!"Activo".equals(usuario.getEstado())) {
			throw new ApiException(403,
					"La cuenta está desactivada o pendiente de activación. Contacta al administrador.");
		}

		if (!encoder.matches(request.password(), usuario.getPassword())) {
			throw new ApiException(401, "Correo o contraseña incorrectos.");
		}

		usuario.setLoginToken(UUID.randomUUID().toString());
		repositorio.save(usuario);

		return new LoginResponse(usuario.getId(), usuario.getNombre(), usuario.getCorreo(),
				usuario.getRol(), usuario.getEstado(), usuario.getLoginToken());
	}

	public void logout(Usuario usuario) {
		usuario.setLoginToken(null);
		repositorio.save(usuario);
	}

	public void solicitarRecuperacion(String correoPeticion) {
		Usuario usuario = repositorio.findByCorreoIgnoreCase(correoPeticion.trim())
				.orElseThrow(() -> new ApiException(404, "No existe una cuenta con ese correo."));

		if (!"Activo".equals(usuario.getEstado())) {
			throw new ApiException(403, "La cuenta está desactivada. Contacta al administrador.");
		}

		String token = UUID.randomUUID().toString();
		usuario.setToken(token);
		repositorio.save(usuario);

		String enlace = baseUrl + "/cambiar-password?token=" + token;
		correo.enviarHtml(usuario.getCorreo(), "Restablece tu contraseña - Observatorio ITM",
				correo.plantillas().correoRecuperacion(usuario.getNombre(), enlace));
	}

	public Usuario cambiarPassword(String token, String nuevaPassword) {
		if (nuevaPassword == null || nuevaPassword.length() < 6) {
			throw new ApiException(400, "La contraseña debe tener al menos 6 caracteres.");
		}

		Usuario usuario = repositorio.findByToken(token)
				.orElseThrow(() -> new ApiException(400, "El enlace no es válido o ya fue utilizado."));

		usuario.setPassword(encoder.encode(nuevaPassword));
		usuario.setToken(null);
		usuario.setPasswordTemporal(null);
		usuario.setEstado("Activo");
		return repositorio.save(usuario);
	}
}