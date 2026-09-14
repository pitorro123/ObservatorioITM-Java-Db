package com.observatorio.backend.servicios;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.observatorio.backend.dtos.usuario.CrearDocenteRequest;
import com.observatorio.backend.dtos.usuario.CrearDocenteResponse;
import com.observatorio.backend.dtos.usuario.UsuarioResponse;
import com.observatorio.backend.excepciones.ApiException;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IUsuarioRepositorio;

@ExtendWith(MockitoExtension.class)
class UsuarioServicioTest {

	@Mock
	private IUsuarioRepositorio repositorio;

	@Mock
	private CorreoServicio correo;

	@Mock
	private PasswordEncoder encoder;

	private UsuarioServicio usuarioServicio;

	@BeforeEach
	void setUp() {
		usuarioServicio = new UsuarioServicio(repositorio, correo, encoder);
		ReflectionTestUtils.setField(usuarioServicio, "baseUrl", "http://localhost:5173");
	}

	@Test
	@DisplayName("listarDocentes() retorna lista de docentes registrados")
	void listarDocentes_exitoso() {
		Usuario docente = new Usuario();
		docente.setId(10L);
		docente.setNombre("Profesor Kepler");
		docente.setCorreo("kepler@itm.edu.co");
		docente.setRol("Docente");
		docente.setEstado("Activo");

		when(repositorio.findByRol("Docente")).thenReturn(List.of(docente));

		List<UsuarioResponse> resultado = usuarioServicio.listarDocentes();

		assertEquals(1, resultado.size());
		assertEquals("Profesor Kepler", resultado.get(0).nombre());
		assertEquals("Docente", resultado.get(0).rol());
	}

	@Test
	@DisplayName("crearDocente() crea docente pendiente, genera contraseña temporal y envía correo")
	void crearDocente_exitoso() {
		CrearDocenteRequest request = new CrearDocenteRequest("Galileo Galilei", "galileo@itm.edu.co");

		when(repositorio.findByCorreoIgnoreCase("galileo@itm.edu.co")).thenReturn(Optional.empty());
		when(encoder.encode(anyString())).thenReturn("hashed_temp_pw");
		when(correo.plantillas()).thenReturn(new CorreoPlantillas());

		CrearDocenteResponse response = usuarioServicio.crearDocente(request);

		assertNotNull(response);
		assertEquals("Galileo Galilei", response.nombre());
		assertEquals("galileo@itm.edu.co", response.correo());
		assertEquals("Docente", response.rol());
		assertEquals("Pendiente", response.estado());
		assertNotNull(response.passwordTemporal());
		verify(repositorio).save(any(Usuario.class));
		verify(correo).enviarHtmlAsync(eq("galileo@itm.edu.co"), anyString(), anyString());
	}

	@Test
	@DisplayName("crearDocente() lanza 400 cuando el correo no tiene formato válido")
	void crearDocente_correoInvalido_lanza400() {
		CrearDocenteRequest request = new CrearDocenteRequest("Nombre Valido", "correo-invalido");

		ApiException ex = assertThrows(ApiException.class, () -> usuarioServicio.crearDocente(request));
		assertEquals(400, ex.getEstado());
		assertEquals("Ingresa el nombre y un correo electrónico válido.", ex.getMessage());
	}

	@Test
	@DisplayName("crearDocente() lanza 409 cuando el correo ya existe")
	void crearDocente_correoDuplicado_lanza409() {
		CrearDocenteRequest request = new CrearDocenteRequest("Copernico", "copernico@itm.edu.co");
		when(repositorio.findByCorreoIgnoreCase("copernico@itm.edu.co")).thenReturn(Optional.of(new Usuario()));

		ApiException ex = assertThrows(ApiException.class, () -> usuarioServicio.crearDocente(request));
		assertEquals(409, ex.getEstado());
		assertEquals("Ya existe una cuenta con ese correo electrónico.", ex.getMessage());
	}

	@Test
	@DisplayName("eliminarDocente() lanza 404 si el docente no existe")
	void eliminarDocente_noExiste_lanza404() {
		when(repositorio.existsById(999L)).thenReturn(false);

		ApiException ex = assertThrows(ApiException.class, () -> usuarioServicio.eliminarDocente(999L));
		assertEquals(404, ex.getEstado());
		assertEquals("El docente no existe.", ex.getMessage());
	}

	@Test
	@DisplayName("eliminarDocente() borra el docente si existe")
	void eliminarDocente_exitoso() {
		when(repositorio.existsById(10L)).thenReturn(true);

		usuarioServicio.eliminarDocente(10L);

		verify(repositorio).deleteById(10L);
	}

	@Test
	@DisplayName("cambiarEstadoDocente() actualiza el estado del docente y guarda cambios")
	void cambiarEstadoDocente_exitoso() {
		Usuario docente = new Usuario();
		docente.setId(5L);
		docente.setEstado("Activo");

		when(repositorio.findById(5L)).thenReturn(Optional.of(docente));
		when(repositorio.save(any(Usuario.class))).thenAnswer(i -> i.getArgument(0));

		UsuarioResponse res = usuarioServicio.cambiarEstadoDocente(5L, "Inactivo");

		assertEquals("Inactivo", res.estado());
		verify(repositorio).save(docente);
	}
}

