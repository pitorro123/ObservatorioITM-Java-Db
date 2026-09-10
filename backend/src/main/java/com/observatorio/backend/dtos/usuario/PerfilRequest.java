package com.observatorio.backend.dtos.usuario;

public record PerfilRequest(String nombre, String correo, String nuevaPassword) {
}