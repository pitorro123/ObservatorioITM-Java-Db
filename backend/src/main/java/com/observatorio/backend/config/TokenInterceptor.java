package com.observatorio.backend.config;

import java.io.IOException;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IUsuarioRepositorio;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class TokenInterceptor implements HandlerInterceptor {

	private final IUsuarioRepositorio repositorio;

	public TokenInterceptor(IUsuarioRepositorio repositorio) {
		this.repositorio = repositorio;
	}

	/** Rutas y métodos que no necesitan sesión (públicas del sistema). */
	private boolean esPublico(String ruta, String metodo) {
		if ("OPTIONS".equals(metodo)) {
			return true;
		}
		if (ruta.startsWith("/api/auth/")) {
			return true;
		}
		if (ruta.equals("/api/eventos/publicados") && "GET".equals(metodo)) {
			return true;
		}
		if (ruta.matches("/api/eventos/p/\\d+") && "GET".equals(metodo)) {
			return true;
		}
		if (ruta.equals("/api/inscripciones") && "POST".equals(metodo)) {
			return true;
		}
		if (ruta.equals("/api/programas") && "GET".equals(metodo)) {
			return true;
		}
		if ((ruta.equals("/api/contenido/semillero") || ruta.equals("/api/contenido/observatorio"))
				&& "GET".equals(metodo)) {
			return true;
		}
		return false;
	}

	private void responderNoAutorizado(HttpServletResponse response) throws IOException {
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType("application/json;charset=UTF-8");
		response.getWriter().write("{\"mensaje\":\"Debes iniciar sesión.\"}");
	}

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws IOException {
		String ruta = request.getRequestURI();
		String metodo = request.getMethod();

		String encabezado = request.getHeader("Authorization");
		if (encabezado != null && encabezado.startsWith("Bearer ")) {
			String token = encabezado.substring(7).trim();
			if (!token.isBlank()) {
				Usuario usuario = repositorio.findByLoginToken(token).orElse(null);
				if (usuario != null) {
					request.setAttribute("usuario", usuario);
					return true;
				}
			}
		}

		if (esPublico(ruta, metodo)) {
			return true;
		}

		responderNoAutorizado(response);
		return false;
	}
}