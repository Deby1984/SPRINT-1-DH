package com.horizonte.user;
import jakarta.validation.constraints.*;
public record RegisterRequest(
        @NotBlank @Size(max=60) String firstName,
        @NotBlank @Size(max=60) String lastName,
        @NotBlank @Email @Size(max=160) String email,
        @NotBlank @Size(min=8, max=72) String password) { }
