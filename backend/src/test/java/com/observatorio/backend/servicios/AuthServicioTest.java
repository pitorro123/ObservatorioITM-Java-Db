package com.observatorio.backend.servicios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.observatorio.backend.dtos.auth.LoginRequest;
import com.observatorio.backend.dtos.auth.LoginResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IUsuarioRepositorio;

@ExtendWith(MockitoExtension.class)
class AuthServicioTest {

	@Mock
	private IUsuarioRepositorio repositorio;

	@Mock
	private CorreoServicio correo;

	@Mock
	private PasswordEncoder encoder;

	private AuthServicio authServicio;

	@BeforeEach
	void setUp() {
		authServicio = new AuthServicio(repositorio, correo, encoder);
		ReflectionTestUtils.setField(authServicio, "baseUrl", "http://localhost:5173");
	}

	@Test
	@DisplayName("login() con credenciales correctas retorna token y datos de usuario")
	void login_exitoso() {
		Usuario usuario = new Usuario();
		usuario.setId(1L);
		usuario.setNombre("Admin ITM");
		usuario.setCorreo("admin@itm.edu.co");
		usuario.setPassword("hash123");
		usuario.setRol("Administrador");
		usuario.setEstado("Activo");

		LoginRequest request = new LoginRequest("admin@itm.edu.co", "password123");

		when(repositorio.findByCorreoIgnoreCase("admin@itm.edu.co")).thenReturn(Optional.of(usuario));
		when(encoder.matches("password123", "hash123")).thenReturn(true);

		LoginResponse response = authServicio.login(request);

		assertNotNull(response);
		assertEquals(1L, response.id());
		assertEquals("Admin ITM", response.nombre());
		assertEquals("admin@itm.edu.co", response.correo());
		assertEquals("Administrador", response.rol());
		assertNotNull(response.token());
		verify(repositorio).save(usuario);
	}

	@Test
	@DisplayName("login() con correo no registrado lanza 404")
	void login_correoNoExiste_lanza404() {
		LoginRequest request = new LoginRequest("inexistente@itm.edu.co", "123456");
		when(repositorio.findByCorreoIgnoreCase("inexistente@itm.edu.co")).thenReturn(Optional.empty());

		ApiException ex = assertThrows(ApiException.class, () -> authServicio.login(request));
		assertEquals(404, ex.getEstado());
		assertEquals("No existe una cuenta con ese correo.", ex.getMessage());
	}

	@Test
	@DisplayName("login() con cuenta inactiva o pendiente lanza 403")
	void login_cuentaInactiva_lanza403() {
		Usuario usuario = new Usuario();
		usuario.setCorreo("docente@itm.edu.co");
		usuario.setEstado("Pendiente");

		LoginRequest request = new LoginRequest("docente@itm.edu.co", "123456");
		when(repositorio.findByCorreoIgnoreCase("docente@itm.edu.co")).thenReturn(Optional.of(usuario));

		ApiException ex = assertThrows(ApiException.class, () -> authServicio.login(request));
		assertEquals(403, ex.getEstado());
	}

	@Test
	@DisplayName("login() con contraseña incorrecta lanza 401")
	void login_passwordIncorrecta_lanza401() {
		Usuario usuario = new Usuario();
		usuario.setCorreo("admin@itm.edu.co");
		usuario.setPassword("hash_correcto");
		usuario.setEstado("Activo");

		LoginRequest request = new LoginRequest("admin@itm.edu.co", "password_falsa");
		when(repositorio.findByCorreoIgnoreCase("admin@itm.edu.co")).thenReturn(Optional.of(usuario));
		when(encoder.matches("password_falsa", "hash_correcto")).thenReturn(false);

		ApiException ex = assertThrows(ApiException.class, () -> authServicio.login(request));
		assertEquals(401, ex.getEstado());
		assertEquals("Correo o contraseña incorrectos.", ex.getMessage());
	}

	@Test
	@DisplayName("logout() invalida y elimina el token de sesión")
	void logout_exitoso() {
		Usuario usuario = new Usuario();
		usuario.setLoginToken("token-activo-123");

		authServicio.logout(usuario);

		assertNull(usuario.getLoginToken());
		verify(repositorio).save(usuario);
	}

	@Test
	@DisplayName("solicitarRecuperacion() genera token y despacha correo de recuperación")
	void solicitarRecuperacion_exitoso() {
		Usuario usuario = new Usuario();
		usuario.setNombre("Carlos");
		usuario.setCorreo("carlos@itm.edu.co");
		usuario.setEstado("Activo");

		when(repositorio.findByCorreoIgnoreCase("carlos@itm.edu.co")).thenReturn(Optional.of(usuario));
		when(correo.plantillas()).thenReturn(new CorreoPlantillas());

		authServicio.solicitarRecuperacion("carlos@itm.edu.co");

		assertNotNull(usuario.getToken());
		verify(repositorio).save(usuario);
		verify(correo).enviarHtmlAsync(eq("carlos@itm.edu.co"), anyString(), anyString());
	}

	@Test
	@DisplayName("cambiarPassword() lanza 400 si la contraseña tiene menos de 6 caracteres")
	void cambiarPassword_passwordCorta_lanza400() {
		ApiException ex = assertThrows(ApiException.class, () -> authServicio.cambiarPassword("token-valido", "123"));
		assertEquals(400, ex.getEstado());
		assertEquals("La contraseña debe tener al menos 6 caracteres.", ex.getMessage());
	}

	@Test
	@DisplayName("cambiarPassword() actualiza la contraseña cifrada y limpia el token")
	void cambiarPassword_exitoso() {
		Usuario usuario = new Usuario();
		usuario.setToken("token-recuperacion");
		usuario.setEstado("Pendiente");

		when(repositorio.findByToken("token-recuperacion")).thenReturn(Optional.of(usuario));
		when(encoder.encode("nuevaPassword123")).thenReturn("hash_nuevo");
		when(repositorio.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

		Usuario actualizado = authServicio.cambiarPassword("token-recuperacion", "nuevaPassword123");

		assertEquals("hash_nuevo", actualizado.getPassword());
		assertEquals("Activo", actualizado.getEstado());
		assertNull(actualizado.getToken());
		assertNull(actualizado.getPasswordTemporal());
		verify(repositorio).save(usuario);
	}
}

