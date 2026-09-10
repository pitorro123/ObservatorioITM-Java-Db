package com.observatorio.backend.servicios;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import com.observatorio.backend.excepciones.ApiException;

import javax.imageio.ImageIO;

@Service
public class QrServicio {

	/**
	 * Genera un QR (PNG) con el texto dado y lo devuelve en base64 para
	 * incrustarlo directo en los correos.
	 */
	public String generarQrBase64(String texto, int tamanio) {
		try {
			Map<EncodeHintType, Object> pistas = new HashMap<>();
			pistas.put(EncodeHintType.CHARACTER_SET, "UTF-8");
			pistas.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
			pistas.put(EncodeHintType.MARGIN, 1);

			BitMatrix matriz = new QRCodeWriter().encode(texto, BarcodeFormat.QR_CODE, tamanio, tamanio, pistas);

			BufferedImage imagen = new BufferedImage(tamanio, tamanio, BufferedImage.TYPE_INT_RGB);
			for (int x = 0; x < tamanio; x++) {
				for (int y = 0; y < tamanio; y++) {
					imagen.setRGB(x, y, matriz.get(x, y) ? 0x000000 : 0xFFFFFF);
				}
			}

			ByteArrayOutputStream bytes = new ByteArrayOutputStream();
			ImageIO.write(imagen, "PNG", bytes);
			return Base64.getEncoder().encodeToString(bytes.toByteArray());
		} catch (Exception e) {
			throw new ApiException(500, "No se pudo generar el código QR: " + e.getMessage());
		}
	}
}