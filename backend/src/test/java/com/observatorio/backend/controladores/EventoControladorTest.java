package com.observatorio.backend.controladores;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.observatorio.backend.dtos.evento.EventoResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.excepciones.ControladorExcepciones;
import com.observatorio.backend.servicios.EventoServicio;

@ExtendWith(MockitoExtension.class)
class EventoControladorTest {

	private MockMvc mockMvc;

	@Mock
	private EventoServicio eventoServicio;

	@InjectMocks
	private EventoControlador eventoControlador;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(eventoControlador)
				.setControllerAdvice(new ControladorExcepciones())
				.build();
	}

	@Test
	@DisplayName("GET /api/eventos/publicados retorna lista de eventos con 200 OK")
	void listarPublicados_retorna200() throws Exception {
		EventoResponse response = new EventoResponse(
				1L, "Noche de Estrellas", "Charla y observación", LocalDate.of(2026, 10, 20),
				"18:00", "Campus Fraternidad", "/img.jpg", "publicado", "Charla", false, 50,
				"Medellin", 1L, "Admin", "Administrador", null, 10, 5);

		when(eventoServicio.listarPublicados()).thenReturn(List.of(response));

		mockMvc.perform(get("/api/eventos/publicados"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id").value(1))
				.andExpect(jsonPath("$[0].titulo").value("Noche de Estrellas"))
				.andExpect(jsonPath("$[0].estado").value("publicado"));
	}

	@Test
	@DisplayName("GET /api/eventos/p/{id} retorna 404 si el evento no existe o no está publicado")
	void obtenerPublico_noExiste_retorna404() throws Exception {
		when(eventoServicio.obtenerPublico(99L))
				.thenThrow(new ApiException(404, "El evento no existe."));

		mockMvc.perform(get("/api/eventos/p/99"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.mensaje").value("El evento no existe."));
	}
}

