package com.observatorio.backend.config;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.observatorio.backend.modelos.Contenido;
import com.observatorio.backend.modelos.Evento;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IContenidoRepositorio;
import com.observatorio.backend.repositorios.IEventoRepositorio;
import com.observatorio.backend.repositorios.IUsuarioRepositorio;

/**
 * Crea el administrador inicial (desde variables de entorno) y el contenido
 * institucional real del sitio. No crea eventos ni inscripciones: esos datos
 * los administra el sistema desde cero.
 */
@Component
public class DatosIniciales implements ApplicationRunner {

	private final IUsuarioRepositorio usuarios;
	private final IEventoRepositorio eventos;
	private final IContenidoRepositorio contenidos;
	private final PasswordEncoder encoder;
	private final ObjectMapper objectMapper;

	@Value("${app.admin.email:admin@itm.edu.co}")
	private String adminEmail;

	@Value("${app.admin.password:admin123}")
	private String adminPassword;

	public DatosIniciales(IUsuarioRepositorio usuarios, IEventoRepositorio eventos,
			IContenidoRepositorio contenidos, PasswordEncoder encoder, ObjectMapper objectMapper) {
		this.usuarios = usuarios;
		this.eventos = eventos;
		this.contenidos = contenidos;
		this.encoder = encoder;
		this.objectMapper = objectMapper;
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		Usuario admin = usuarios.findByCorreoIgnoreCase(adminEmail).orElse(null);
		if (admin == null) {
			admin = new Usuario();
			admin.setNombre("Administrador");
			admin.setCorreo(adminEmail);
			admin.setPassword(encoder.encode(adminPassword));
			admin.setRol("Administrador");
			admin.setEstado("Activo");
			admin = usuarios.save(admin);
		}

		// Docentes demo iniciales
		if (usuarios.findByCorreoIgnoreCase("juan.camilo@itm.edu.co").isEmpty()) {
			Usuario doc1 = new Usuario();
			doc1.setNombre("Juan Camilo");
			doc1.setCorreo("juan.camilo@itm.edu.co");
			doc1.setPassword(encoder.encode("docente123"));
			doc1.setRol("Docente");
			doc1.setEstado("Activo");
			usuarios.save(doc1);
		}

		if (usuarios.findByCorreoIgnoreCase("laura.gomez@itm.edu.co").isEmpty()) {
			Usuario doc2 = new Usuario();
			doc2.setNombre("Laura Gómez");
			doc2.setCorreo("laura.gomez@itm.edu.co");
			doc2.setPassword(encoder.encode("docente123"));
			doc2.setRol("Docente");
			doc2.setEstado("Activo");
			usuarios.save(doc2);
		}

		// Sembrar eventos iniciales si la tabla está vacía
		if (eventos.count() == 0) {
			sembrarEventos(admin);
		}

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

		sembrarContenido("observatorio", Map.of(
				"titulo", "Sobre el Observatorio Astronómico del ITM",
				"descripcion",
				"El observatorio astronómico del ITM es un espacio dedicado a la divulgación, investigación y formación astronómica. Aquí puedes descubrir todo lo que hacemos.",
				"trayectoria", List.of(
						"El Observatorio Astronómico del ITM es un espacio dedicado a la divulgación científica y a la formación de la comunidad en astronomía.",
						"Ofrece servicios de observación pública, talleres educativos, conferencias y actividades de intercambio científico.",
						"Cuenta con telescopios y equipos especializados disponibles para los estudiantes y la ciudadanía."),
				"mision",
				"Acercar la astronomía a la comunidad del ITM y de la ciudad mediante observaciones, formación y proyectos de investigación abiertos al público.",
				"vision",
				"Ser un referente regional en divulgación astronómica, formando nuevas generaciones interesadas en la ciencia y el estudio del universo."));
	}

	private void sembrarContenido(String clave, Map<String, Object> datos) throws Exception {
		if (contenidos.findByClave(clave).isPresent()) {
			return;
		}
		Contenido contenido = new Contenido();
		contenido.setClave(clave);
		contenido.setValor(objectMapper.writeValueAsString(datos));
		contenidos.save(contenido);
	}

	private void sembrarEventos(Usuario admin) {
		List<Evento> lista = List.of(
			crearEvento("Tinto bajo las estrellas",
				"Acompáñanos a la observación mientras charlamos sobre cuerpos celestes y nos tomamos un tintico.",
				LocalDate.of(2026, 9, 3), "16:00",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 30, "/images/events/tinto-estrellas.png", "publicado", "observacion", 12, 0, null, admin),
			crearEvento("Noche de meteoros",
				"Observación abierta a la comunidad para disfrutar la lluvia de meteoros con telescopios del observatorio.",
				LocalDate.of(2026, 9, 18), "19:00",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				true, null, "/images/events/noche-meteoros.jpg", "publicado", "observacion", 47, 0, null, admin),
			crearEvento("Taller: Introducción a la astrofotografía",
				"Aprende los conceptos básicos para capturar imágenes del cielo nocturno con telescopios y cámaras astronómicas.",
				LocalDate.of(2026, 9, 26), "17:00",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 25, "/images/events/astrofotografia.jpg", "publicado", "charla", 14, 0, null, admin),
			crearEvento("Descubriendo el eclipse",
				"Charla abierta sobre los eclipses, sus tipos y cómo observarlos de forma segura.",
				LocalDate.of(2026, 10, 8), "15:00",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 40, "/images/Imagen (1).png", "publicado", "charla", 5, 0, null, admin),
			crearEvento("Lluvia de estrellas del sur",
				"Observación guiada para apreciar las perseidas desde el observatorio con máximo rendimiento.",
				LocalDate.of(2026, 10, 15), "20:00",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 45, "/images/Imagen (2).png", "borrador", "observacion", 0, 0, null, admin),
			crearEvento("Noche de observación lunar",
				"Sesión dedicada a observar la superficie de la Luna, sus cráteres y mares.",
				LocalDate.of(2026, 11, 5), "18:00",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 35, "/images/Imagen (3).png", "borrador", "observacion", 0, 0, null, admin),
			crearEvento("Brillos en el cielo: satélites",
				"Aprende a identificar satélites artificiales y estaciones espaciales a simple vista.",
				LocalDate.of(2026, 11, 20), "19:30",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 35, "/images/Imagen (4).png", "publicado", "charla", 35, 0, null, admin),
			crearEvento("Los colores del arcoíris: espectroscopía",
				"Taller práctico de espectroscopía para entender qué compone la luz de las estrellas.",
				LocalDate.of(2026, 12, 3), "16:30",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 20, "/images/Imagen (5).png", "cancelado", "charla", 0, 0, "Condiciones meteorológicas adversas", admin),
			crearEvento("Observando la ciudad desde las alturas",
				"Actividad de observación urbana del cielo nocturno sobre Medellín desde el observatorio.",
				LocalDate.of(2026, 12, 12), "19:00",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 30, "/images/Imagen (6).png", "borrador", "abierto", 0, 0, null, admin),
			crearEvento("Conociendo a Saturno",
				"Observación dedicada al planeta Saturno y sus anillos con los telescopios del observatorio.",
				LocalDate.of(2027, 1, 8), "20:30",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 40, "/images/Imagen (7).png", "publicado", "observacion", 18, 0, null, admin),
			crearEvento("Conferencia: Vida más allá de la Tierra",
				"Charla sobre exoplanetas y la búsqueda de vida fuera del sistema solar.",
				LocalDate.of(2027, 1, 20), "17:00",
				"Auditorio ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 80, "/images/Imagen.png", "borrador", "charla", 0, 0, null, admin),
			crearEvento("Maratón Messier",
				"Intento de observar la mayor cantidad posible de objetos Messier en una sola noche.",
				LocalDate.of(2027, 1, 30), "21:00",
				"Observatorio Astronómico ITM - Sede Fraternidad",
				"Institución Universitaria ITM · Campus Fraternidad, Cl. 54a #30-01, Villa Hermosa, Medellín, Antioquia",
				false, 30, "/images/events/maraton-messier.jpg", "publicado", "observacion", 22, 0, null, admin)
		);
		eventos.saveAll(lista);
	}

	private Evento crearEvento(String titulo, String descripcion, LocalDate fecha, String hora,
			String lugar, String ubicacionMapa, boolean esMasivo, Integer capacidad,
			String imagen, String estado, String tipo, int inscritos, int asistentes,
			String motivoCancelacion, Usuario autor) {
		Evento e = new Evento();
		e.setTitulo(titulo);
		e.setDescripcion(descripcion);
		e.setFecha(fecha);
		e.setHora(hora);
		e.setLugar(lugar);
		e.setUbicacionMapa(ubicacionMapa);
		e.setEsMasivo(esMasivo);
		e.setCapacidad(capacidad);
		e.setImagen(imagen);
		e.setEstado(estado);
		e.setTipo(tipo);
		e.setInscritos(inscritos);
		e.setAsistentes(asistentes);
		e.setMotivoCancelacion(motivoCancelacion);
		if (autor != null) {
			e.setCreadoPorId(autor.getId());
			e.setCreadoPorNombre(autor.getNombre());
			e.setCreadoPorRol(autor.getRol());
		}
		return e;
	}
}