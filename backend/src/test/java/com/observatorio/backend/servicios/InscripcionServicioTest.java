package com.observatorio.backend.servicios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.observatorio.backend.dtos.inscripcion.InscripcionRequest;
import com.observatorio.backend.dtos.inscripcion.InscripcionResponse;
import com.observatorio.backend.dtos.inscripcion.ValidacionResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Asistencia;
import com.observatorio.backend.modelos.Evento;
import com.observatorio.backend.modelos.Inscripcion;
import com.observatorio.backend.modelos.Participante;
import com.observatorio.backend.repositorios.IAsistenciaRepositorio;
import com.observatorio.backend.repositorios.IEventoRepositorio;
import com.observatorio.backend.repositorios.IInscripcionRepositorio;
import com.observatorio.backend.repositorios.IParticipanteRepositorio;
import com.observatorio.backend.repositorios.IProgramaAcademicoRepositorio;

@ExtendWith(MockitoExtension.class)
class InscripcionServicioTest {

	@Mock
	private IInscripcionRepositorio inscripciones;

	@Mock
	private IEventoRepositorio eventos;

	@Mock
	private IParticipanteRepositorio participantes;

	@Mock
	private IProgramaAcademicoRepositorio programas;

	@Mock
	private IAsistenciaRepositorio asistencias;

	@Mock
	private CorreoServicio correo;

	@Mock
	private QrServicio qr;

	private InscripcionServicio inscripcionServicio;

	@BeforeEach
	void setUp() {
		inscripcionServicio = new InscripcionServicio(
				inscripciones, eventos, participantes, programas, asistencias, correo, qr);
	}

	@Test
	@DisplayName("inscribir() genera inscripción exitosa con código de 4 dígitos y despacho de correo")
	void inscribir_exitoso() {
		Evento evento = new Evento();
		evento.setId(10L);
		evento.setTitulo("Maratón Messier");
		evento.setEstado("publicado");
		evento.setFecha(LocalDate.now().plusDays(5));
		evento.setHora("19:00");
		evento.setLugar("Campus Robledo");
		evento.setInscritos(0);

		InscripcionRequest request = new InscripcionRequest(
				10L,
				"Yessica Laverde",
				"Yessica",
				"Laverde",
				"CC",
				"10203040",
				"yessica@itm.edu.co",
				"3001234567",
				"Estudiante",
				"Ingeniería de Sistemas",
				1L);

		when(eventos.findById(10L)).thenReturn(Optional.of(evento));
		when(inscripciones.existsByEventoIdAndCorreoIgnoreCase(10L, "yessica@itm.edu.co")).thenReturn(false);
		when(inscripciones.existsByEventoIdAndNumeroDocumentoIgnoreCase(10L, "10203040")).thenReturn(false);
		when(participantes.findFirstByNumeroDocumentoIgnoreCase("10203040")).thenReturn(Optional.empty());
		when(participantes.save(any(Participante.class))).thenAnswer(i -> i.getArgument(0));
		when(programas.findById(1L)).thenReturn(Optional.empty());
		when(inscripciones.existsByCodigo(anyString())).thenReturn(false);
		when(inscripciones.save(any(Inscripcion.class))).thenAnswer(i -> {
			Inscripcion ins = i.getArgument(0);
			ins.setId(50L);
			return ins;
		});
		when(qr.generarQrBase64(anyString(), anyInt())).thenReturn("base64qrstring");
		when(correo.plantillas()).thenReturn(new CorreoPlantillas());

		InscripcionResponse response = inscripcionServicio.inscribir(request);

		assertNotNull(response);
		assertEquals(50L, response.id());
		assertEquals("10203040", response.numeroDocumento());
		assertEquals("yessica@itm.edu.co", response.correo());
		assertNotNull(response.codigo());
		verify(inscripciones).save(any(Inscripcion.class));
		verify(correo).enviarHtmlAsync(eq("yessica@itm.edu.co"), anyString(), anyString());
	}

	@Test
	@DisplayName("inscribir() en evento masivo marca asistencia automáticamente y guarda registro en Asistencia")
	void inscribir_eventoMasivo_marcaAsistenciaAutomaticamente() {
		Evento evento = new Evento();
		evento.setId(20L);
		evento.setTitulo("Festival de Astronomía Masivo");
		evento.setEstado("publicado");
		evento.setEsMasivo(true);
		evento.setFecha(LocalDate.now());
		evento.setHora("14:00");
		evento.setLugar("Campus Fraternidad");
		evento.setInscritos(0);
		evento.setAsistentes(0);

		InscripcionRequest request = new InscripcionRequest(
				20L,
				"Carlos Restrepo",
				"Carlos",
				"Restrepo",
				"CC",
				"71223344",
				"carlos@itm.edu.co",
				"3115554433",
				"Estudiante",
				"Ingeniería Electrónica",
				null);

		when(eventos.findById(20L)).thenReturn(Optional.of(evento));
		when(inscripciones.existsByEventoIdAndCorreoIgnoreCase(20L, "carlos@itm.edu.co")).thenReturn(false);
		when(inscripciones.existsByEventoIdAndNumeroDocumentoIgnoreCase(20L, "71223344")).thenReturn(false);
		when(participantes.findFirstByNumeroDocumentoIgnoreCase("71223344")).thenReturn(Optional.empty());
		when(participantes.save(any(Participante.class))).thenAnswer(i -> i.getArgument(0));
		when(inscripciones.save(any(Inscripcion.class))).thenAnswer(i -> {
			Inscripcion ins = i.getArgument(0);
			ins.setId(88L);
			return ins;
		});
		when(asistencias.save(any(Asistencia.class))).thenAnswer(i -> i.getArgument(0));

		InscripcionResponse response = inscripcionServicio.inscribir(request);

		assertNotNull(response);
		assertEquals(88L, response.id());
		assertEquals("Asistió", response.asistencia());
		assertEquals(true, response.esMasivo());
		assertEquals(1, evento.getAsistentes());
		verify(asistencias).save(any(Asistencia.class));
	}

	@Test
	@DisplayName("inscribir() en evento NASA masivo genera código de 4 dígitos y envía correo con QR")
	void inscribir_eventoNasaMasivo_generaCodigoYEnviaCorreo() {
		Evento evento = new Evento();
		evento.setId(30L);
		evento.setTitulo("🚀 Conferencia Espacial NASA");
		evento.setTipo("nasa");
		evento.setEstado("publicado");
		evento.setEsMasivo(true);
		evento.setFecha(LocalDate.now().plusDays(10));
		evento.setHora("10:00");
		evento.setLugar("Auditorio Mayor ITM");
		evento.setInscritos(0);
		evento.setAsistentes(0);

		InscripcionRequest request = new InscripcionRequest(
				30L,
				"Astronauta Ramirez",
				"Astronauta",
				"Ramirez",
				"CC",
				"10203040",
				"astro@itm.edu.co",
				"3009998877",
				"Docente",
				"Astronomía",
				null,
				true,
				"Ninguna",
				"SURA",
				"Carro",
				"NASA999");

		when(eventos.findById(30L)).thenReturn(Optional.of(evento));
		when(inscripciones.existsByEventoIdAndCorreoIgnoreCase(30L, "astro@itm.edu.co")).thenReturn(false);
		when(inscripciones.existsByEventoIdAndNumeroDocumentoIgnoreCase(30L, "10203040")).thenReturn(false);
		when(inscripciones.existsByCodigo(anyString())).thenReturn(false);
		when(participantes.findFirstByNumeroDocumentoIgnoreCase("10203040")).thenReturn(Optional.empty());
		when(participantes.save(any(Participante.class))).thenAnswer(i -> i.getArgument(0));
		when(inscripciones.save(any(Inscripcion.class))).thenAnswer(i -> {
			Inscripcion ins = i.getArgument(0);
			ins.setId(99L);
			return ins;
		});
		when(qr.generarQrBase64(anyString(), anyInt())).thenReturn("base64nasaqr");
		when(correo.plantillas()).thenReturn(new CorreoPlantillas());

		InscripcionResponse response = inscripcionServicio.inscribir(request);

		assertNotNull(response);
		assertEquals(99L, response.id());
		assertNotNull(response.codigo());
		assertEquals("Pendiente", response.asistencia());
		assertEquals(true, response.esMasivo());
		verify(qr).generarQrBase64(anyString(), eq(300));
		verify(correo).enviarHtmlAsync(eq("astro@itm.edu.co"), anyString(), anyString());
		verify(asistencias, never()).save(any(Asistencia.class));
	}

	@Test
	@DisplayName("inscribir() lanza 409 si el participante ya está registrado en el evento")
	void inscribir_yaInscrito_lanza409() {
		Evento evento = new Evento();
		evento.setId(10L);
		evento.setEstado("publicado");
		evento.setFecha(LocalDate.now().plusDays(5));

		InscripcionRequest request = new InscripcionRequest(
				10L, "Pedro Perez", "Pedro", "Perez", "CC", "998877", "pedro@itm.edu.co",
				"3001112233", "Estudiante", null, null);

		when(eventos.findById(10L)).thenReturn(Optional.of(evento));
		when(inscripciones.existsByEventoIdAndCorreoIgnoreCase(10L, "pedro@itm.edu.co")).thenReturn(true);

		ApiException ex = assertThrows(ApiException.class, () -> inscripcionServicio.inscribir(request));
		assertEquals(409, ex.getEstado());
		assertEquals("Ya existe una inscripción registrada con ese correo electrónico en este evento.", ex.getMessage());
	}

	@Test
	@DisplayName("validarCodigo() retorna datos del participante para verificar en portería")
	void validarCodigo_exitoso() {
		Evento evento = new Evento();
		evento.setId(12L);
		evento.setTitulo("Charla de Agujeros Negros");
		evento.setFecha(LocalDate.now());
		evento.setHora("18:00");
		evento.setLugar("Auditorio");

		Inscripcion inscripcion = new Inscripcion();
		inscripcion.setId(100L);
		inscripcion.setCodigo("4521");
		inscripcion.setEventoId(12L);
		inscripcion.setNombre("Laura Gomez");
		inscripcion.setAsistencia("Pendiente");

		when(inscripciones.findFirstByEventoIdAndCodigoIgnoreCase(12L, "4521")).thenReturn(Optional.of(inscripcion));
		when(eventos.findById(12L)).thenReturn(Optional.of(evento));
		when(asistencias.findByInscripcionId(100L)).thenReturn(Optional.empty());

		ValidacionResponse res = inscripcionServicio.validarCodigo("4521", 12L);

		assertNotNull(res);
		assertEquals("4521", res.codigo());
		assertEquals("Laura Gomez", res.nombre());
		assertEquals("Pendiente", res.asistencia());
	}

	@Test
	@DisplayName("marcarAsistencia() marca asistencia correctamente y suma contador")
	void marcarAsistencia_exitoso() {
		Evento evento = new Evento();
		evento.setId(12L);
		evento.setTitulo("Charla de Agujeros Negros");
		evento.setAsistentes(0);

		Inscripcion inscripcion = new Inscripcion();
		inscripcion.setId(100L);
		inscripcion.setCodigo("4521");
		inscripcion.setEventoId(12L);
		inscripcion.setNombre("Laura Gomez");
		inscripcion.setNumeroDocumento("776655");
		inscripcion.setCorreo("laura@itm.edu.co");
		inscripcion.setAsistencia("Pendiente");

		when(inscripciones.findFirstByEventoIdAndCodigoIgnoreCase(12L, "4521")).thenReturn(Optional.of(inscripcion));
		when(asistencias.existsByInscripcionId(100L)).thenReturn(false);
		when(asistencias.save(any(Asistencia.class))).thenAnswer(i -> i.getArgument(0));
		when(eventos.findById(12L)).thenReturn(Optional.of(evento));

		InscripcionResponse res = inscripcionServicio.marcarAsistencia("4521", 12L);

		assertNotNull(res);
		assertEquals("4521", res.codigo());
		assertEquals("Asistió", res.asistencia());
		verify(asistencias).save(any(Asistencia.class));
		verify(eventos).save(evento);
		assertEquals(1, evento.getAsistentes());
	}

	@Test
	@DisplayName("marcarAsistencia() lanza 409 si la asistencia ya fue validada previamente")
	void marcarAsistencia_yaValidada_lanza409() {
		Inscripcion inscripcion = new Inscripcion();
		inscripcion.setId(101L);
		inscripcion.setCodigo("7788");
		inscripcion.setEventoId(12L);
		inscripcion.setAsistencia("Asistió");

		when(inscripciones.findFirstByEventoIdAndCodigoIgnoreCase(12L, "7788")).thenReturn(Optional.of(inscripcion));
		when(asistencias.existsByInscripcionId(101L)).thenReturn(true);

		ApiException ex = assertThrows(ApiException.class, () -> inscripcionServicio.marcarAsistencia("7788", 12L));
		assertEquals(409, ex.getEstado());
		assertEquals("Este registro ya fue validado anteriormente.", ex.getMessage());
	}
}

