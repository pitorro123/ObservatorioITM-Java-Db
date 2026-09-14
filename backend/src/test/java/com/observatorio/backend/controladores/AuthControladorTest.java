package com.observatorio.backend.controladores;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.observatorio.backend.dtos.auth.LoginRequest;
import com.observatorio.backend.dtos.auth.LoginResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.excepciones.ControladorExcepciones;
import com.observatorio.backend.servicios.AuthServicio;
import com.observatorio.backend.servicios.SeguridadServicio;

@ExtendWith(MockitoExtension.class)
class AuthControladorTest {

	private MockMvc mockMvc;

	@Mock
	private AuthServicio authServicio;

	@Mock
	private SeguridadServicio seguridadServicio;

	@InjectMocks
	private AuthControlador authControlador;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(authControlador)
				.setControllerAdvice(new ControladorExcepciones())
				.build();
	}

	@Test
	@DisplayName("POST /api/auth/login retorna 200 OK con token al autenticar")
	void login_exitoso_retorna200() throws Exception {
		LoginResponse mockResponse = new LoginResponse(
				1L, "Admin ITM", "admin@itm.edu.co", "Administrador", "Activo", "token-xyz");

		when(authServicio.login(any(LoginRequest.class))).thenReturn(mockResponse);

		String json = """
				{
					"correo": "admin@itm.edu.co",
					"password": "password123"
				}
				""";

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1))
				.andExpect(jsonPath("$.nombre").value("Admin ITM"))
				.andExpect(jsonPath("$.token").value("token-xyz"));
	}

	@Test
	@DisplayName("POST /api/auth/login con credenciales inválidas retorna 401 Unauthorized")
	void login_credencialesInvalidas_retorna401() throws Exception {
		when(authServicio.login(any(LoginRequest.class)))
				.thenThrow(new ApiException(401, "Correo o contraseña incorrectos."));

		String json = """
				{
					"correo": "admin@itm.edu.co",
					"password": "wrong"
				}
				""";

		mockMvc.perform(post("/api/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.mensaje").value("Correo o contraseña incorrectos."));
	}

	@Test
	@DisplayName("POST /api/auth/recuperar retorna 200 OK")
	void recuperar_retorna200() throws Exception {
		String json = """
				{
					"correo": "usuario@itm.edu.co"
				}
				""";

		mockMvc.perform(post("/api/auth/recuperar")
				.contentType(MediaType.APPLICATION_JSON)
				.content(json))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.exito").value(true));
	}
}

