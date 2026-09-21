package com.observatorio.backend.servicios;

import org.springframework.stereotype.Service;

/**
 * Plantillas de correo con HTML/CSS estilo de la marca del Observatorio ITM
 * (azul marino, azul y dorado), listas para enviarse con el CorreoServicio.
 */
@Service
public class CorreoPlantillas {

	private static final String AZUL = "#3368b8";
	private static final String AZUL_OSCURO = "#1c2d5a";
	private static final String DORADO = "#d9a441";

	private String envolver(String titulo, String cuerpo) {
		return "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"UTF-8\">"
				+ "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
				+ "<title>" + titulo + "</title></head>"
				+ "<body style=\"margin:0;padding:0;background-color:#eef1f6;"
				+ "font-family:'Segoe UI',Helvetica,Arial,sans-serif;\">"
				+ "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\""
				+ " style=\"background-color:#eef1f6;padding:24px 12px;\"><tr><td align=\"center\">"
				+ "<table role=\"presentation\" width=\"620\" cellpadding=\"0\" cellspacing=\"0\""
				+ " style=\"max-width:620px;width:100%;border-radius:16px;overflow:hidden;"
				+ "box-shadow:0 10px 30px rgba(28,45,90,0.12);\">"
				+ "<tr><td style=\"background-color:" + AZUL_OSCURO + ";padding:28px 32px;"
				+ "border-bottom:6px solid " + DORADO + ";\">"
				+ "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\"><tr><td>"
				+ "<p style=\"margin:0;color:#ffffff;font-size:20px;font-weight:700;\">Observatorio Astronómico ITM</p>"
				+ "<p style=\"margin:4px 0 0;color:#cbd5e1;font-size:12px;\">Institución Universitaria</p>"
				+ "</td><td align=\"right\" style=\"vertical-align:middle;\">"
				+ "<span style=\"display:inline-block;width:14px;height:14px;border-radius:50%;"
				+ "background-color:" + DORADO + ";\"></span></td></tr></table></td></tr>"
				+ "<tr><td style=\"background-color:#ffffff;padding:28px 32px;color:#334155;\">"
				+ "<h1 style=\"margin:0 0 10px;color:" + AZUL_OSCURO + ";font-size:22px;\">" + titulo + "</h1>"
				+ cuerpo
				+ "<p style=\"margin:24px 0 0;font-size:13px;color:#64748b;text-align:center;\">"
				+ "¿Alguna duda? Escríbenos al Observatorio Astronómico del ITM.</p></td></tr>"
				+ "<tr><td style=\"background-color:" + AZUL_OSCURO + ";padding:16px 32px;\">"
				+ "<p style=\"margin:0;color:#cbd5e1;font-size:11px;text-align:center;\">"
				+ "© Observatorio Astronómico ITM · Medellín, Colombia</p></td></tr>"
				+ "</table></td></tr></table></body></html>";
	}

	private String boton(String enlace, String texto) {
		return "<p style=\"text-align:center;margin:18px 0 6px;\">"
				+ "<a href=\"" + enlace + "\" style=\"display:inline-block;background-color:" + AZUL
				+ ";color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;"
				+ "font-weight:600;font-size:14px;\">" + texto + "</a></p>";
	}

	private String bloqueCodigo(String codigoReal) {
		return "<tr><td align=\"center\">"
				+ "<p style=\"margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;"
				+ "color:#64748b;\">Tu código de registro</p></td></tr>"
				+ "<tr><td align=\"center\" style=\"padding:16px 0;\">"
				+ "<span style=\"font-family:Consolas,Menlo,monospace;font-size:20px;font-weight:700;"
				+ "color:" + AZUL_OSCURO + ";background-color:#eef1f6;border-radius:8px;"
				+ "padding:10px 18px;letter-spacing:1px;\">" + codigoReal + "</span></td></tr>";
	}

	private String caja(String contenidoHtml) {
		return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\""
				+ " style=\"background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;"
				+ "margin:14px 0;\"><tr><td style=\"padding:14px 16px;font-size:13px;line-height:1.6;\">"
				+ contenidoHtml + "</td></tr></table>";
	}

	/** Correo con el enlace para que el docente active su cuenta. */
	public String correoActivacionDocente(String nombre, String enlace, String passwordTemporal) {
		String cuerpo =
				"<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;\">Hola <strong>" + nombre + "</strong>,"
				+ " te hemos creado una cuenta de <strong>Docente</strong> en el sistema de eventos del Observatorio"
				+ " Astronómico ITM.</p>"
				+ "<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;\">Para terminar tu registro solo"
				+ " debes asignar tu contraseña. El enlace es de un solo uso:</p>"
				+ boton(enlace, "Configurar mi contraseña")
				+ caja("<p style=\"margin:0 0 6px;\"><strong>Contraseña temporal</strong> (por si el enlace no abre):"
						+ "</p><p style=\"margin:0;font-family:Consolas,Menlo,monospace;font-weight:700;"
						+ "color:" + AZUL_OSCURO + ";\">" + passwordTemporal + "</p>");
		return envolver("Activa tu cuenta de docente", cuerpo);
	}

	/** Correo con el enlace para restablecer la contraseña. */
	public String correoRecuperacion(String nombre, String enlace) {
		String cuerpo =
				"<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;\">Hola <strong>" + nombre + "</strong>,"
				+ " recibimos una solicitud para restablecer tu contraseña.</p>"
				+ "<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;\">Haz clic en el botón para"
				+ " crear una nueva contraseña. Si no fuiste tú, ignora este correo.</p>"
				+ boton(enlace, "Restablecer mi contraseña");
		return envolver("Restablece tu contraseña", cuerpo);
	}

	/** Correo de confirmación de inscripción con su QR o solo código de 4 dígitos. */
	public String correoConfirmacionInscripcion(String nombre, String evento, String fecha, String hora,
			String lugar, String codigo, String qrBase64) {
		boolean tieneQr = qrBase64 != null && !qrBase64.isBlank();
		String mensajeInstruccion = tieneQr
				? "Presenta este código QR o código numérico en la entrada del evento para registrar tu asistencia:"
				: "Presenta este código de 4 dígitos o tu documento de identidad en la entrada del evento para validar tu asistencia en sitio:";

		String seccionQr = tieneQr
				? ("<p style=\"text-align:center;margin:12px 0 0;\">"
						+ "<img src=\"data:image/png;base64," + qrBase64 + "\" alt=\"Código QR\" width=\"180\" height=\"180\""
						+ " style=\"display:inline-block;border-radius:8px;border:1px solid #e2e8f0;background:#ffffff;padding:8px;\">"
						+ "</p>")
				: "";

		String cuerpo =
				"<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;\">¡Hola <strong>" + nombre
				+ "</strong>! Tu inscripción al evento está confirmada.</p>"
				+ caja("<p style=\"margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;"
						+ "letter-spacing:1.5px;\">Evento</p>"
						+ "<p style=\"margin:0;font-size:16px;font-weight:700;color:" + AZUL_OSCURO + ";\">" + evento + "</p>"
						+ "<p style=\"margin:10px 0 0;font-size:13px;color:#334155;\">📅 Fecha: <strong>" + fecha + "</strong></p>"
						+ "<p style=\"margin:4px 0;font-size:13px;color:#334155;\">🕒 Hora: <strong>" + hora + "</strong></p>"
						+ "<p style=\"margin:4px 0 0;font-size:13px;color:#334155;\">📍 Lugar: <strong>" + lugar + "</strong></p>")
				+ "<p style=\"margin:14px 0 0;font-size:13px;line-height:1.6;\">" + mensajeInstruccion + "</p>"
				+ bloqueCodigo(codigo)
				+ seccionQr;
		return envolver("¡Inscripción confirmada!", cuerpo);
	}

	/** Correo para el docente (profesor) con el QR control de un asistente. */
	public String correoQrDocente(String nombreDocente, String evento, String nombreInscrito,
			String codigo, String qrBase64) {
		String cuerpo =
				"<p style=\"margin:0 0 14px;font-size:14px;line-height:1.6;\">Hola <strong>" + nombreDocente
				+ "</strong>, te enviamos el código de control del participante:</p>"
				+ caja("<p style=\"margin:0 0 4px;color:#64748b;font-size:11px;text-transform:uppercase;"
						+ "letter-spacing:1.5px;\">Participante</p>"
						+ "<p style=\"margin:0;font-size:16px;font-weight:700;color:" + AZUL_OSCURO + ";\">" + nombreInscrito + "</p>"
						+ "<p style=\"margin:10px 0 0;font-size:13px;color:#334155;\">Evento: <strong>" + evento + "</strong></p>")
				+ "<p style=\"margin:14px 0 0;font-size:13px;line-height:1.6;\">Puedes validar la asistencia"
				+ " escaneando este código desde el panel de administración:</p>"
				+ bloqueCodigo(codigo)
				+ "<p style=\"text-align:center;margin:10px 0 0;\">"
				+ "<img src=\"data:image/png;base64," + qrBase64 + "\" alt=\"Código QR\" width=\"180\" height=\"180\""
				+ " style=\"display:inline-block;border-radius:8px;border:1px solid #e2e8f0;background:#ffffff;padding:8px;\">"
				+ "</p>";
		return envolver("Código de control del participante", cuerpo);
	}
}