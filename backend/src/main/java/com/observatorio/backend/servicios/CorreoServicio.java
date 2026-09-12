package com.observatorio.backend.servicios;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.observatorio.backend.excepciones.ApiException;

import jakarta.mail.internet.MimeMessage;

@Service
public class CorreoServicio {

	private static final Logger log = LoggerFactory.getLogger(CorreoServicio.class);

	private final JavaMailSender mailSender;
	private final CorreoPlantillas plantillas;

	@Value("${spring.mail.username:}")
	private String remitente;

	public CorreoServicio(JavaMailSender mailSender, CorreoPlantillas plantillas) {
		this.mailSender = mailSender;
		this.plantillas = plantillas;
	}

	public CorreoPlantillas plantillas() {
		return plantillas;
	}

	public void enviarHtml(String para, String asunto, String cuerpoHtml) {
		if (remitente == null || remitente.isBlank()) {
			log.warn("SMTP no configurado (MAIL_USERNAME no definido). Omitiendo envio de correo a {}", para);
			return;
		}
		try {
			MimeMessage mensaje = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
			helper.setFrom(remitente);
			helper.setTo(para);
			helper.setSubject(asunto);
			helper.setText(cuerpoHtml, true);
			mailSender.send(mensaje);
		} catch (Exception e) {
			log.error("No se pudo enviar el correo a {}: {}", para, e.getMessage());
		}
	}
}