package com.observatorio.backend.dtos.inscripcion;

public record InscripcionRequest(Long eventoId, String nombre, String correo, String telefono) {
}