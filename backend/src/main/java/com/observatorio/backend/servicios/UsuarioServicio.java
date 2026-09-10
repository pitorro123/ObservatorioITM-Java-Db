package com.observatorio.backend.servicios;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.observatorio.backend.dtos.usuario.CrearDocenteRequest;
import com.observatorio.backend.dtos.usuario.PerfilRequest;
import com.observatorio.backend.dtos.usuario.UsuarioResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IUsuarioRepositorio;

@Service
public class UsuarioServicio {

	private final IUsuarioRepositorio repositorio;
	private final CorreoServicio correo;
	private final PasswordEncoder encoder;

	@Value("${app.public.base-url:http://localhost:5173}")
	private String baseUrl;

	public UsuarioServicio(IUsuarioRepositorio repositorio, CorreoServicio correo, PasswordEncoder encoder) {
		this.repositorio = repositorio;
		this.correo = correo;
		this.encoder = encoder;
	}

	private UsuarioResponse aRespuesta(Usuario usuario) {
		return new UsuarioResponse(usuario.getId(), usuario.getNombre(), usuario.getCorreo(),
				usuario.getRol(), usuario.getEstado());
	}

	public List<UsuarioResponse> listarDocentes() {
		return repositorio.findByRol("Docente").stream().map(this::aRespuesta).toList();
	}

	public UsuarioResponse crearDocente(CrearDocenteRequest request) {
		String nombre = (request.nombre() == null ? "" : request.nombre()).trim();
		String correoTexto = (request.correo() == null ? "" : request.correo()).trim();

		if (nombre.isEmpty() || !correoTexto.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
			throw new ApiException(400, "Ingresa el nombre y un correo electrónico válido.");
		}

		if (repositorio.findByCorreoIgnoreCase(correoTexto).isPresent()) {
			throw new ApiException(409, "Ya existe una cuenta con ese correo electrónico.");
		}

		String passwordTemporal = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
		String token = UUID.randomUUID().toString();

		Usuario docente = new Usuario();
		docente.setNombre(nombre);
		docente.setCorreo(correoTexto);
		docente.setRol("Docente");
		docente.setEstado("Pendiente");
		docente.setPasswordTemporal(passwordTemporal);
		docente.setPassword(encoder.encode(passwordTemporal));
		docente.setToken(token);
		repositorio.save(docente);

		String enlace = baseUrl + "/cambiar-password?token=" + token;
		correo.enviarHtml(docente.getCorreo(), "Activa tu cuenta de docente - Observatorio ITM",
				correo.plantillas().correoActivacionDocente(nombre, enlace, passwordTemporal));

		return aRespuesta(docente);
	}

	public UsuarioResponse editarDocente(Long id, CrearDocenteRequest request) {
		Usuario usuario = repositorio.findById(id)
				.orElseThrow(() -> new ApiException(404, "El docente no existe."));

		if (request.nombre() != null && !request.nombre().isBlank()) {
			usuario.setNombre(request.nombre().trim());
		}

		if (request.correo() != null && !request.correo().isBlank()) {
			String correoNuevo = request.correo().trim();
			repositorio.findByCorreoIgnoreCase(correoNuevo).ifPresent(existente -> {
				if (!existente.getId().equals(usuario.getId())) {
					throw new ApiException(409, "Ya existe una cuenta con ese correo electrónico.");
				}
			});
			usuario.setCorreo(correoNuevo);
		}

		return aRespuesta(repositorio.save(usuario));
	}

	public void eliminarDocente(Long id) {
		if (!repositorio.existsById(id)) {
			throw new ApiException(404, "El docente no existe.");
		}
		repositorio.deleteById(id);
	}

	public UsuarioResponse actualizarPerfil(Usuario usuario, PerfilRequest request) {
		if (request.nombre() != null && !request.nombre().isBlank()) {
			usuario.setNombre(request.nombre().trim());
		}

		if (request.correo() != null && !request.correo().isBlank()) {
			String correoNuevo = request.correo().trim();
			repositorio.findByCorreoIgnoreCase(correoNuevo).ifPresent(existente -> {
				if (!existente.getId().equals(usuario.getId())) {
					throw new ApiException(409, "Ya existe una cuenta con ese correo electrónico.");
				}
			});
			usuario.setCorreo(correoNuevo);
		}

		if (request.nuevaPassword() != null && !request.nuevaPassword().isBlank()) {
			if (request.nuevaPassword().length() < 6) {
				throw new ApiException(400, "La contraseña debe tener al menos 6 caracteres.");
			}
			usuario.setPassword(encoder.encode(request.nuevaPassword()));
		}

		return aRespuesta(repositorio.save(usuario));
	}
}