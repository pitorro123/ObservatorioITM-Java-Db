package com.observatorio.backend.dtos.usuario;

public record UsuarioResponse(Long id, String nombre, String correo, String rol, String estado) {
}