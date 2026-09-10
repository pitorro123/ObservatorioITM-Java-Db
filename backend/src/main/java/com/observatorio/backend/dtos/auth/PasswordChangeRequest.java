package com.observatorio.backend.dtos.auth;

public record PasswordChangeRequest(String token, String nuevaPassword) {
}