package com.observatorio.backend.servicios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Usuario;

import jakarta.servlet.http.HttpServletRequest;

class SeguridadServicioTest {

	private SeguridadServicio seguridadServicio;

	@BeforeEach
	void setUp() {
		seguridadServicio = new SeguridadServicio();
	}

	@AfterEach
	void tearDown() {
		RequestContextHolder.resetRequestAttributes();
	}

	@Test
	@DisplayName("usuarioActual() lanza 401 si no hay atributos de petición")
	void usuarioActual_sinAtributosPeticion_lanza401() {
		RequestContextHolder.resetRequestAttributes();

		ApiException ex = assertThrows(ApiException.class, () -> seguridadServicio.usuarioActual());
		assertEquals(401, ex.getEstado());
		assertEquals("Debes iniciar sesión.", ex.getMessage());
	}

	@Test
	@DisplayName("usuarioActual() lanza 401 si el usuario no está en los atributos del request")
	void usuarioActual_sinUsuarioEnRequest_lanza401() {
		HttpServletRequest request = mock(HttpServletRequest.class);
		when(request.getAttribute("usuario")).thenReturn(null);
		RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

		ApiException ex = assertThrows(ApiException.class, () -> seguridadServicio.usuarioActual());
		assertEquals(401, ex.getEstado());
	}

	@Test
	@DisplayName("usuarioActual() retorna el usuario si está presente en el request")
	void usuarioActual_conUsuario_retornaUsuario() {
		HttpServletRequest request = mock(HttpServletRequest.class);
		Usuario usuario = new Usuario();
		usuario.setId(1L);
		usuario.setNombre("Test Admin");
		usuario.setRol("Administrador");

		when(request.getAttribute("usuario")).thenReturn(usuario);
		RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

		Usuario resultado = seguridadServicio.usuarioActual();
		assertNotNull(resultado);
		assertEquals(1L, resultado.getId());
		assertEquals("Test Admin", resultado.getNombre());
	}

	@Test
	@DisplayName("exigirAdministrador() permite acceso si el rol es Administrador")
	void exigirAdministrador_rolAdmin_retornaUsuario() {
		HttpServletRequest request = mock(HttpServletRequest.class);
		Usuario usuario = new Usuario();
		usuario.setId(1L);
		usuario.setRol("Administrador");

		when(request.getAttribute("usuario")).thenReturn(usuario);
		RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

		Usuario resultado = seguridadServicio.exigirAdministrador();
		assertEquals("Administrador", resultado.getRol());
	}

	@Test
	@DisplayName("exigirAdministrador() lanza 403 si el rol no es Administrador")
	void exigirAdministrador_rolDocente_lanza403() {
		HttpServletRequest request = mock(HttpServletRequest.class);
		Usuario usuario = new Usuario();
		usuario.setId(2L);
		usuario.setRol("Docente");

		when(request.getAttribute("usuario")).thenReturn(usuario);
		RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

		ApiException ex = assertThrows(ApiException.class, () -> seguridadServicio.exigirAdministrador());
		assertEquals(403, ex.getEstado());
		assertEquals("No tienes permisos para realizar esta acción.", ex.getMessage());
	}
}

