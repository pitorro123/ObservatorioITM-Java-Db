package com.observatorio.backend.config;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.observatorio.backend.modelos.Contenido;
import com.observatorio.backend.modelos.Usuario;
import com.observatorio.backend.repositorios.IContenidoRepositorio;
import com.observatorio.backend.repositorios.IUsuarioRepositorio;

/**
 * Crea el administrador inicial (desde variables de entorno) y el contenido
 * institucional real del sitio. No crea eventos ni inscripciones: esos datos
 * los administra el sistema desde cero.
 */
@Component
public class DatosIniciales implements ApplicationRunner {

	private final IUsuarioRepositorio usuarios;
	private final IContenidoRepositorio contenidos;
	private final PasswordEncoder encoder;
	private final ObjectMapper objectMapper;

	@Value("${app.admin.email:admin@itm.edu.co}")
	private String adminEmail;

	@Value("${app.admin.password:admin123}")
	private String adminPassword;

	public DatosIniciales(IUsuarioRepositorio usuarios, IContenidoRepositorio contenidos,
			PasswordEncoder encoder, ObjectMapper objectMapper) {
		this.usuarios = usuarios;
		this.contenidos = contenidos;
		this.encoder = encoder;
		this.objectMapper = objectMapper;
	}

	@Override
	public void run(ApplicationArguments args) throws Exception {
		if (usuarios.count() == 0) {
			Usuario admin = new Usuario();
			admin.setNombre("Administrador");
			admin.setCorreo(adminEmail);
			admin.setPassword(encoder.encode(adminPassword));
			admin.setRol("Administrador");
			admin.setEstado("Activo");
			usuarios.save(admin);
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
}