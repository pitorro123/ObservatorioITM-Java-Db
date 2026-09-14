package com.observatorio.backend.servicios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.observatorio.backend.dtos.evento.EventoRequest;
import com.observatorio.backend.dtos.evento.EventoResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Evento;
import com.observatorio.backend.repositorios.IEventoRepositorio;

@ExtendWith(MockitoExtension.class)
class EventoServicioTest {

	@Mock
	private IEventoRepositorio repositorio;

	private EventoServicio eventoServicio;

	@BeforeEach
	void setUp() {
		eventoServicio = new EventoServicio(repositorio);
	}

	@Test
	@DisplayName("crear() guarda evento con estado y valores correctos")
	void crear_eventoValido_guardaExitosamente() {
		EventoRequest request = new EventoRequest(
				"Noche de Estrellas",
				"Observación con telescopios",
				"2026-10-15",
				"19:00",
				"Terraza Bloque F",
				"https://i.ibb.co/foto.jpg",
				"publicado",
				"Observación",
				true,
				100,
				"Medellín ITM",
				1L,
				"Admin ITM",
				"Administrador",
				null);

		when(repositorio.save(any(Evento.class))).thenAnswer(i -> {
			Evento e = i.getArgument(0);
			e.setId(100L);
			return e;
		});

		EventoResponse response = eventoServicio.crear(request);

		assertNotNull(response);
		assertEquals(100L, response.id());
		assertEquals("Noche de Estrellas", response.titulo());
		assertEquals("publicado", response.estado());
		verify(repositorio).save(any(Evento.class));
	}

	@Test
	@DisplayName("crear() lanza 400 si faltan campos obligatorios")
	void crear_camposFaltantes_lanza400() {
		EventoRequest request = new EventoRequest(
				"",
				"Sin titulo",
				"2026-10-15",
				"19:00",
				"Lugar",
				null, null, null, null, null, null, null, null, null, null);

		ApiException ex = assertThrows(ApiException.class, () -> eventoServicio.crear(request));
		assertEquals(400, ex.getEstado());
		assertEquals("Completa todos los campos obligatorios del evento.", ex.getMessage());
	}

	@Test
	@DisplayName("crear() lanza 400 si el estado no es válido")
	void crear_estadoInvalido_lanza400() {
		EventoRequest request = new EventoRequest(
				"Conferencia",
				"Descripcion",
				"2026-10-15",
				"10:00",
				"Aula Magna",
				null,
				"estado_invalido",
				null, null, null, null, null, null, null, null);

		ApiException ex = assertThrows(ApiException.class, () -> eventoServicio.crear(request));
		assertEquals(400, ex.getEstado());
		assertEquals("El estado del evento no es válido.", ex.getMessage());
	}

	@Test
	@DisplayName("listarPublicados() retorna solo eventos en estado publicado")
	void listarPublicados_retornaSoloPublicados() {
		Evento e = new Evento();
		e.setId(1L);
		e.setTitulo("Taller de Cohetería");
		e.setFecha(LocalDate.of(2026, 11, 20));
		e.setEstado("publicado");

		when(repositorio.findByEstadoOrderByFechaAsc("publicado")).thenReturn(List.of(e));

		List<EventoResponse> lista = eventoServicio.listarPublicados();

		assertEquals(1, lista.size());
		assertEquals("Taller de Cohetería", lista.get(0).titulo());
	}

	@Test
	@DisplayName("obtenerPublico() lanza 404 si el evento está en borrador")
	void obtenerPublico_enBorrador_lanza404() {
		Evento e = new Evento();
		e.setId(2L);
		e.setEstado("borrador");

		when(repositorio.findById(2L)).thenReturn(Optional.of(e));

		ApiException ex = assertThrows(ApiException.class, () -> eventoServicio.obtenerPublico(2L));
		assertEquals(404, ex.getEstado());
	}

	@Test
	@DisplayName("publicar() actualiza el estado del evento a publicado")
	void publicar_exitoso() {
		Evento e = new Evento();
		e.setId(5L);
		e.setEstado("borrador");

		when(repositorio.findById(5L)).thenReturn(Optional.of(e));
		when(repositorio.save(any(Evento.class))).thenAnswer(i -> i.getArgument(0));

		EventoResponse publicado = eventoServicio.publicar(5L);

		assertEquals("publicado", publicado.estado());
		verify(repositorio).save(e);
	}

	@Test
	@DisplayName("cancelar() actualiza el estado a cancelado y registra el motivo")
	void cancelar_exitoso() {
		Evento e = new Evento();
		e.setId(3L);
		e.setEstado("publicado");

		when(repositorio.findById(3L)).thenReturn(Optional.of(e));
		when(repositorio.save(any(Evento.class))).thenAnswer(i -> i.getArgument(0));

		EventoResponse cancelado = eventoServicio.cancelar(3L, "Lluvia intensa");

		assertEquals("cancelado", cancelado.estado());
		assertEquals("Lluvia intensa", cancelado.motivoCancelacion());
		verify(repositorio).save(e);
	}
}

