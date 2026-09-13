package com.observatorio.backend.servicios;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.mail.internet.MimeMessage;

@Service
public class CorreoServicio {

	private static final Logger log = LoggerFactory.getLogger(CorreoServicio.class);

	private final JavaMailSender mailSender;
	private final CorreoPlantillas plantillas;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient;

	@Value("${spring.mail.username:}")
	private String remitente;

	@Value("${correo.brevo.api-key:}")
	private String brevoApiKey;

	@Value("${correo.resend.api-key:}")
	private String resendApiKey;

	@Value("${correo.remitente-nombre:Observatorio Astronómico ITM}")
	private String remitenteNombre;

	public CorreoServicio(JavaMailSender mailSender, CorreoPlantillas plantillas, ObjectMapper objectMapper) {
		this.mailSender = mailSender;
		this.plantillas = plantillas;
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newBuilder()
				.connectTimeout(Duration.ofSeconds(6))
				.build();
	}

	public CorreoPlantillas plantillas() {
		return plantillas;
	}

	public String getRemitente() {
		return remitente;
	}

	public JavaMailSender getMailSender() {
		return mailSender;
	}

	public String getBrevoApiKey() {
		return brevoApiKey;
	}

	public String getResendApiKey() {
		return resendApiKey;
	}

	/**
	 * Envío asíncrono para no bloquear los controladores ni ralentizar la UI del usuario.
	 */
	public void enviarHtmlAsync(String para, String asunto, String cuerpoHtml) {
		CompletableFuture.runAsync(() -> {
			try {
				enviarHtml(para, asunto, cuerpoHtml);
			} catch (Exception e) {
				log.error("Fallo inesperado en envio asincrono a {}: {}", para, e.getMessage(), e);
			}
		});
	}

	/**
	 * Envía un correo electrónico con formato HTML.
	 * Prioriza el API HTTP (Brevo o Resend) sobre HTTPS (puerto 443) ya que las nubes como Render
	 * bloquean puertos SMTP salientes (25, 465, 587). Si no hay API key, utiliza JavaMailSender (SMTP).
	 */
	public boolean enviarHtml(String para, String asunto, String cuerpoHtml) {
		// 1. Intentar via Brevo HTTP API (Puerto 443 - garantizado en Render)
		if (brevoApiKey != null && !brevoApiKey.isBlank()) {
			return enviarViaBrevo(para, asunto, cuerpoHtml);
		}

		// 2. Intentar via Resend HTTP API (Puerto 443 - garantizado en Render)
		if (resendApiKey != null && !resendApiKey.isBlank()) {
			return enviarViaResend(para, asunto, cuerpoHtml);
		}

		// 3. Fallback a JavaMailSender (SMTP)
		if (remitente == null || remitente.isBlank()) {
			log.warn("SMTP no configurado (MAIL_USERNAME no definido). Omitiendo envio de correo a {}", para);
			return false;
		}

		try {
			MimeMessage mensaje = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
			helper.setFrom(remitente);
			helper.setTo(para);
			helper.setSubject(asunto);
			helper.setText(cuerpoHtml, true);
			mailSender.send(mensaje);
			log.info("Correo SMTP enviado exitosamente a {}", para);
			return true;
		} catch (Exception e) {
			log.error("No se pudo enviar el correo SMTP a {}: {}", para, e.getMessage());
			return false;
		}
	}

	private boolean enviarViaBrevo(String para, String asunto, String cuerpoHtml) {
		try {
			String emailEmisor = (remitente != null && !remitente.isBlank()) ? remitente : "observatorio@itm.edu.co";
			Map<String, Object> payload = Map.of(
					"sender", Map.of("name", remitenteNombre, "email", emailEmisor),
					"to", List.of(Map.of("email", para)),
					"subject", asunto,
					"htmlContent", cuerpoHtml
			);

			String json = objectMapper.writeValueAsString(payload);
			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create("https://api.brevo.com/v3/smtp/email"))
					.header("api-key", brevoApiKey.trim())
					.header("Content-Type", "application/json")
					.header("Accept", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
					.timeout(Duration.ofSeconds(10))
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() >= 200 && response.statusCode() < 300) {
				log.info("Correo enviado exitosamente via Brevo API a {}", para);
				return true;
			} else {
				log.error("Error respuesta Brevo API [{}] al enviar a {}: {}", response.statusCode(), para, response.body());
				return false;
			}
		} catch (Exception e) {
			log.error("Excepcion al enviar correo via Brevo a {}: {}", para, e.getMessage(), e);
			return false;
		}
	}

	private boolean enviarViaResend(String para, String asunto, String cuerpoHtml) {
		try {
			String emailEmisor = remitenteNombre + " <onboarding@resend.dev>";
			Map<String, Object> payload = Map.of(
					"from", emailEmisor,
					"to", List.of(para),
					"subject", asunto,
					"html", cuerpoHtml
			);

			String json = objectMapper.writeValueAsString(payload);
			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create("https://api.resend.com/emails"))
					.header("Authorization", "Bearer " + resendApiKey.trim())
					.header("Content-Type", "application/json")
					.header("Accept", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
					.timeout(Duration.ofSeconds(10))
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() >= 200 && response.statusCode() < 300) {
				log.info("Correo enviado exitosamente via Resend API a {}", para);
				return true;
			} else {
				log.error("Error respuesta Resend API [{}] al enviar a {}: {}", response.statusCode(), para, response.body());
				return false;
			}
		} catch (Exception e) {
			log.error("Excepcion al enviar correo via Resend a {}: {}", para, e.getMessage(), e);
			return false;
		}
	}
}