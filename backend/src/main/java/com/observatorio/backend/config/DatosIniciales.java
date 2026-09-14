package com.observatorio.backend.config;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.observatorio.backend.modelos.Asistencia;
import com.observatorio.backend.modelos.Contenido;
import com.observatorio.backend.modelos.Evento;
import com.observatorio.backend.modelos.Inscripcion;
import com.observatorio.backend.modelos.Participante;
import com.observatorio.backend.modelos.Permiso;
import com.observatorio.backend.modelos.ProgramaAcademico;
import com.observatorio.backend.modelos.Rol;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IAsistenciaRepositorio;
import com.observatorio.backend.repositorios.IContenidoRepositorio;
import com.observatorio.backend.repositorios.IEventoRepositorio;
import com.observatorio.backend.repositorios.IInscripcionRepositorio;
import com.observatorio.backend.repositorios.IParticipanteRepositorio;
import com.observatorio.backend.repositorios.IPermisoRepositorio;
import com.observatorio.backend.repositorios.IProgramaAcademicoRepositorio;
import com.observatorio.backend.repositorios.IRolRepositorio;
import com.observatorio.backend.repositorios.IUsuarioRepositorio;

/**
 * Siembra de datos iniciales en 3FN: Roles, Permisos, Programas Académicos,
 * Administrador, Docentes demo y contenido institucional.
 */
@Component
public class DatosIniciales implements ApplicationRunner {

	private final IUsuarioRepositorio usuarios;
	private final IEventoRepositorio eventos;
	private final IContenidoRepositorio contenidos;
	private final IRolRepositorio roles;
	private final IPermisoRepositorio permisos;
	private final IProgramaAcademicoRepositorio programas;
	private final IParticipanteRepositorio participantes;
	private final IInscripcionRepositorio inscripciones;
	private final IAsistenciaRepositorio asistencias;
	private final PasswordEncoder encoder;
	private final ObjectMapper objectMapper;
	private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

	@Value("${app.admin.email:admin@itm.edu.co}")
	private String adminEmail;

	@Value("${app.admin.password:admin123}")
	private String adminPassword;

	public DatosIniciales(
			IUsuarioRepositorio usuarios,
			IEventoRepositorio eventos,
			IContenidoRepositorio contenidos,
			IRolRepositorio roles,
			IPermisoRepositorio permisos,
			IProgramaAcademicoRepositorio programas,
			IParticipanteRepositorio participantes,
			IInscripcionRepositorio inscripciones,
			IAsistenciaRepositorio asistencias,
			PasswordEncoder encoder,
			ObjectMapper objectMapper,
			org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		this.usuarios = usuarios;
		this.eventos = eventos;
		this.contenidos = contenidos;
		this.roles = roles;
		this.permisos = permisos;
		this.programas = programas;
		this.participantes = participantes;
		this.inscripciones = inscripciones;
		this.asistencias = asistencias;
		this.encoder = encoder;
		this.objectMapper = objectMapper;
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		// Ajuste DDL para soportar imágenes en Base64 o URLs extensas
		try {
			jdbcTemplate.execute("ALTER TABLE eventos MODIFY COLUMN imagen LONGTEXT");
		} catch (Exception ignored) {
		}

		// 1. Sembrar Permisos (3FN)
		Permiso pCrearEvento = obtenerOCrearPermiso("CREAR_EVENTO");
		Permiso pEditarEvento = obtenerOCrearPermiso("EDITAR_EVENTO");
		Permiso pEliminarEvento = obtenerOCrearPermiso("ELIMINAR_EVENTO");
		Permiso pPublicarEvento = obtenerOCrearPermiso("PUBLICAR_EVENTO");
		Permiso pCancelarEvento = obtenerOCrearPermiso("CANCELAR_EVENTO");
		Permiso pValidarAsistencia = obtenerOCrearPermiso("VALIDAR_ASISTENCIA");
		Permiso pGestionarDocentes = obtenerOCrearPermiso("GESTIONAR_DOCENTES");

		// 2. Sembrar Roles con sus relaciones ManyToMany a Permisos
		Rol rolAdmin = roles.findFirstByNombreIgnoreCase("Administrador").orElse(null);
		if (rolAdmin == null) {
			rolAdmin = new Rol("Administrador");
			rolAdmin.setPermisos(new HashSet<>(Set.of(
					pCrearEvento, pEditarEvento, pEliminarEvento,
					pPublicarEvento, pCancelarEvento, pValidarAsistencia, pGestionarDocentes
			)));
			rolAdmin = roles.save(rolAdmin);
		}

		Rol rolDocente = roles.findFirstByNombreIgnoreCase("Docente").orElse(null);
		if (rolDocente == null) {
			rolDocente = new Rol("Docente");
			rolDocente.setPermisos(new HashSet<>(Set.of(
					pCrearEvento, pEditarEvento, pValidarAsistencia
			)));
			rolDocente = roles.save(rolDocente);
		}

		// 3. Sembrar Programas Académicos del ITM (3FN)
		sembrarProgramasAcademicos();

		// 4. Administrador inicial
		Usuario admin = usuarios.findByCorreoIgnoreCase(adminEmail).orElse(null);
		if (admin == null) {
			admin = new Usuario();
			admin.setNombre("Administrador");
			admin.setCorreo(adminEmail);
			admin.setPassword(encoder.encode(adminPassword));
			admin.setRolEntidad(rolAdmin);
			admin.setRol("Administrador");
			admin.setEstado("Activo");
			admin.setImagenUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80");
			admin = usuarios.save(admin);
		} else if (admin.getRolEntidad() == null) {
			admin.setRolEntidad(rolAdmin);
			if (admin.getImagenUrl() == null) {
				admin.setImagenUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80");
			}
			admin = usuarios.save(admin);
		}

		// 5. Docentes demo iniciales (Gestionados por el Administrador - Relación autorreferencial)
		Usuario doc1 = usuarios.findByCorreoIgnoreCase("juan.camilo@itm.edu.co").orElse(null);
		if (doc1 == null) {
			doc1 = new Usuario();
			doc1.setNombre("Juan Camilo");
			doc1.setCorreo("juan.camilo@itm.edu.co");
			doc1.setPassword(encoder.encode("docente123"));
			doc1.setRolEntidad(rolDocente);
			doc1.setRol("Docente");
			doc1.setEstado("Activo");
			doc1.setCreadoPor(admin);
			doc1.setImagenUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80");
			usuarios.save(doc1);
		} else if (doc1.getRolEntidad() == null) {
			doc1.setRolEntidad(rolDocente);
			doc1.setCreadoPor(admin);
			usuarios.save(doc1);
		}

		Usuario doc2 = usuarios.findByCorreoIgnoreCase("laura.gomez@itm.edu.co").orElse(null);
		if (doc2 == null) {
			doc2 = new Usuario();
			doc2.setNombre("Laura Gómez");
			doc2.setCorreo("laura.gomez@itm.edu.co");
			doc2.setPassword(encoder.encode("docente123"));
			doc2.setRolEntidad(rolDocente);
			doc2.setRol("Docente");
			doc2.setEstado("Activo");
			doc2.setCreadoPor(admin);
			doc2.setImagenUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80");
			usuarios.save(doc2);
		} else if (doc2.getRolEntidad() == null) {
			doc2.setRolEntidad(rolDocente);
			doc2.setCreadoPor(admin);
			usuarios.save(doc2);
		}

		// 6. Sembrar eventos iniciales si la tabla está vacía
		if (eventos.count() == 0) {
			sembrarEventos(admin);
		}

		// 7. Migración automática de inscripciones previas a Participante y Asistencia (3FN)
		migrarInscripcionesHistoricas();

		// 8. Contenido institucional
		sembrarContenido("semillero", Map.of(
				"titulo", "Semillero de astronomía",
				"descripcion",
				"Nuestro semillero de astronomía ofrece aprendizaje y experiencias en astronomía para estudiantes apasionados por el universo.",
				"objetivos", List.of(
						"Desarrollar habilidades de observación astronómica en los estudiantes.",
						"Fomentar la investigación en astronomía y ciencias afines.",
						"Participar en proyectos y actividades de divulgación científica.",
						"Crear una comunidad de aprendizaje permanente alrededor de la astronomía."),
				"comoParticipar",
				"Para hacer parte del semillero, escríbenos al correo observatorioitm25@gmail.com indicando tu nombre, programa académico y motivación para participar. También puedes acercarte al observatorio en la Sede Fraternidad durante las jornadas de observación."));

		Map<String, Object> obsData = new java.util.LinkedHashMap<>();
		obsData.put("titulo", "Sobre el Observatorio Astronómico del ITM");
		obsData.put("descripcion", "El observatorio astronómico del ITM es un espacio dedicado a la divulgación, investigación y formación astronómica. Aquí puedes descubrir todo lo que hacemos.");
		obsData.put("trayectoria", List.of(
				"El Observatorio Astronómico del ITM es un espacio dedicado a la divulgación científica y a la formación de la comunidad en astronomía.",
				"Ofrece servicios de observación pública, talleres educativos, conferencias y actividades de intercambio científico.",
				"Cuenta con telescopios y equipos especializados disponibles para los estudiantes y la ciudadanía."));
		obsData.put("mision", "Acercar la astronomía a la comunidad del ITM y de la ciudad mediante observaciones, formación y proyectos de investigación abiertos al público.");
		obsData.put("vision", "Ser un referente regional y nacional en divulgación científica, educación astronómica y apropiación social del conocimiento.");
		obsData.put("servicios", List.of(
				"Noches de telescopio y observación solar.",
				"Talleres de astrofotografía y óptica astronómica.",
				"Visitas guiadas para colegios, universidades y público general.",
				"Semillero de investigación en astronomía y ciencias del espacio."));
		sembrarContenido("observatorio", obsData);
	}

	private Permiso obtenerOCrearPermiso(String nombre) {
		return permisos.findFirstByNombreIgnoreCase(nombre)
				.orElseGet(() -> permisos.save(new Permiso(nombre)));
	}

	private void sembrarProgramasAcademicos() {
		List<String> lista = List.of(
				// Ingenierías
				"Ingeniería Biomédica",
				"Ingeniería de Sistemas",
				"Ingeniería de Telecomunicaciones",
				"Ingeniería Electromecánica",
				"Ingeniería Electrónica",
				"Ingeniería Mecatrónica",
				"Tecnología en Automatización Electrónica",
				"Tecnología en Desarrollo de Software",
				"Tecnología en Gestión de Redes de Telecomunicaciones",
				"Tecnología en Mantenimiento de Equipo Biomédico",
				"Tecnología en Sistemas de Información",
				"Tecnología en Sistemas Mecatrónicos",
				"Tecnología en Telecomunicaciones",
				// Económicas y Administrativas
				"Administración Tecnológica",
				"Contaduría Pública",
				"Ingeniería de la Producción",
				"Ingeniería Financiera",
				"Tecnología en Análisis de Costos y Presupuestos",
				"Tecnología en Gestión Administrativa",
				"Tecnología en Producción Industrial",
				// Ciencias Exactas
				"Ciencia de Datos",
				"Química Industrial",
				"Tecnología en Calidad",
				"Tecnología en Control de la Calidad",
				// Artes y Humanidades
				"Artes de la Grabación y Producción Musical",
				"Artes Visuales",
				"Cine",
				"Diseño Industrial",
				"Tecnología en Diseño y Programación de Soluciones de Software",
				"Tecnología en Informática Musical",
				"Tecnología en Producción de Cine y TV",
				// Otros
				"Posgrado / Maestría / Doctorado ITM",
				"Otro programa académico"
		);

		for (String nombre : lista) {
			if (programas.findFirstByNombreIgnoreCase(nombre).isEmpty()) {
				programas.save(new ProgramaAcademico(nombre));
			}
		}
	}

	private void migrarInscripcionesHistoricas() {
		List<Inscripcion> lista = inscripciones.findAll();
		for (Inscripcion ins : lista) {
			if (ins.getParticipante() == null && ins.getCorreo() != null) {
				String correo = ins.getCorreo().trim().toLowerCase();
				String doc = ins.getNumeroDocumento() != null ? ins.getNumeroDocumento().trim() : "";
				if (doc.isEmpty()) doc = "ND-" + ins.getId();

				Participante part = participantes.findFirstByNumeroDocumentoIgnoreCase(doc)
						.or(() -> participantes.findFirstByCorreoIgnoreCase(correo))
						.orElse(null);

				if (part == null) {
					part = new Participante();
					String nombre = ins.getNombre() != null ? ins.getNombre().trim() : "Participante";
					String[] partes = nombre.split("\\s+");
					part.setNombres(partes[0]);
					part.setApellidos(partes.length > 1 ? partes[1] : partes[0]);
					part.setTipoDocumento(ins.getTipoDocumento() != null ? ins.getTipoDocumento() : "CC");
					part.setNumeroDocumento(doc);
					part.setCorreo(correo);
					part.setTelefono(ins.getTelefono() != null ? ins.getTelefono() : "");
					part.setRelacionUniversidad(ins.getRelacionUniversidad() != null ? ins.getRelacionUniversidad() : "Externo");

					if (ins.getProgramaAcademico() != null && !ins.getProgramaAcademico().isBlank()) {
						part.setProgramaAcademico(programas.findFirstByNombreIgnoreCase(ins.getProgramaAcademico().trim()).orElse(null));
					}
					part = participantes.save(part);
				}

				ins.setParticipante(part);

				if ("Asistió".equalsIgnoreCase(ins.getAsistencia()) && !asistencias.existsByInscripcionId(ins.getId())) {
					Asistencia a = new Asistencia(ins);
					a.setFechaHoraAsistencia(ins.getFechaInscripcion() != null ? ins.getFechaInscripcion() : Instant.now());
					asistencias.save(a);
					ins.setAsistenciaRegistro(a);
				}

				inscripciones.save(ins);
			}
		}
	}

	private void sembrarEventos(Usuario admin) {
		Evento e1 = new Evento();
		e1.setTitulo("Noche de Luna y Planetas");
		e1.setDescripcion("Acompáñanos a observar la Luna en fase creciente, Júpiter y sus cuatro lunas galileanas a través de nuestros telescopios profesionales. Charla introductoria sobre el sistema solar y observación libre guiada por profesores del semillero.");
		e1.setFecha(LocalDate.now().plusDays(5));
		e1.setHora("18:30");
		e1.setHoraInicio("18:30");
		e1.setHoraFin("21:00");
		e1.setLugar("Terraza Observatorio ITM · Campus Fraternidad");
		e1.setDireccion("Cl. 54a #30-01, Campus Fraternidad, Medellín");
		e1.setLatitud(6.2415);
		e1.setLongitud(-75.5492);
		e1.setCapacidad(60);
		e1.setEsMasivo(false);
		e1.setEstado("publicado");
		e1.setTipo("observacion");
		e1.setImagen("https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80");
		e1.setUbicacionMapa("Terraza Observatorio ITM · Campus Fraternidad, Medellín");
		e1.setCreadoPorId(admin.getId());
		e1.setCreadoPorNombre(admin.getNombre());
		e1.setCreadoPorRol(admin.getRol());
		e1.setCreadoPorUsuario(admin);
		eventos.save(e1);

		Evento e2 = new Evento();
		e2.setTitulo("Taller de Astrofotografía para Principiantes");
		e2.setDescripcion("Aprende a capturar el cielo nocturno con tu cámara o smartphone. Exploraremos conceptos básicos de exposición, enfoque al infinito, uso de trípode y apilado básico de imágenes. No se requiere experiencia previa.");
		e2.setFecha(LocalDate.now().plusDays(12));
		e2.setHora("16:00");
		e2.setHoraInicio("16:00");
		e2.setHoraFin("19:00");
		e2.setLugar("Aula 302 Bloque E · Campus Fraternidad");
		e2.setDireccion("Cl. 54a #30-01, Campus Fraternidad, Medellín");
		e2.setLatitud(6.2415);
		e2.setLongitud(-75.5492);
		e2.setCapacidad(35);
		e2.setEsMasivo(false);
		e2.setEstado("publicado");
		e2.setTipo("charla");
		e2.setImagen("https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80");
		e2.setUbicacionMapa("Aula 302 Bloque E · Campus Fraternidad, Medellín");
		e2.setCreadoPorId(admin.getId());
		e2.setCreadoPorNombre(admin.getNombre());
		e2.setCreadoPorRol(admin.getRol());
		e2.setCreadoPorUsuario(admin);
		eventos.save(e2);
	}

	private void sembrarContenido(String clave, Map<String, Object> data) {
		try {
			Contenido contenido = contenidos.findByClave(clave).orElse(null);
			if (contenido == null) {
				contenido = new Contenido();
				contenido.setClave(clave);
				contenido.setValor(objectMapper.writeValueAsString(data));
				contenidos.save(contenido);
			}
		} catch (Exception e) {
			// Continúa si no se puede guardar
		}
	}
}