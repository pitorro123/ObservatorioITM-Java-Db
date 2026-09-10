package com.observatorio.backend.dtos.auth;

public record LoginResponse(Long id, String nombre, String correo, String rol, String estado, String token) {
}