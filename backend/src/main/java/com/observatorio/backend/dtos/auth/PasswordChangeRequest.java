package com.observatorio.backend.dtos.auth;

import com.fasterxml.jackson.annotation.JsonAlias;

public record PasswordChangeRequest(
		String token,
		@JsonAlias({ "password", "nueva_password" }) String nuevaPassword) {
}