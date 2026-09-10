package com.observatorio.backend.servicios;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.observatorio.backend.excepciones.ApiException;

import jakarta.mail.internet.MimeMessage;

@Service
public class CorreoServicio {

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
			throw new ApiException(500,
					"SMTP no configurado: define MAIL_USERNAME y MAIL_PASSWORD (tu token) en el archivo .env");
		}
		try {
			MimeMessage mensaje = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
			helper.setFrom(remitente);
			helper.setTo(para);
			helper.setSubject(asunto);
			helper.setText(cuerpoHtml, true);
			mailSender.send(mensaje);
		} catch (jakarta.mail.MessagingException e) {
			throw new ApiException(502, "No se pudo enviar el correo a " + para + ": " + e.getMessage());
		}
	}
}