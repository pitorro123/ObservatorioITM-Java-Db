package com.observatorio.backend.servicios;

import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Usuario;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class SeguridadServicio {

	public Usuario usuarioActual() {
		ServletRequestAttributes atributos = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
		if (atributos == null) {
			throw new ApiException(401, "Debes iniciar sesión.");
		}
		HttpServletRequest peticion = atributos.getRequest();
		Usuario usuario = (Usuario) peticion.getAttribute("usuario");
		if (usuario == null) {
			throw new ApiException(401, "Debes iniciar sesión.");
		}
		return usuario;
	}

	public Usuario exigirAdministrador() {
		Usuario usuario = usuarioActual();
		if (!"Administrador".equals(usuario.getRol())) {
			throw new ApiException(403, "No tienes permisos para realizar esta acción.");
		}
		return usuario;
	}
}