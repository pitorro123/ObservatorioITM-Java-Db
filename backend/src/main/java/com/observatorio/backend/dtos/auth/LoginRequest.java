package com.observatorio.backend.dtos.auth;

public record LoginRequest(String correo, String password) {
}