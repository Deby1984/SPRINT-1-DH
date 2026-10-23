package com.horizonte.category;

import com.horizonte.validation.HttpUrl;
import jakarta.validation.constraints.*;

public record CategoryRequest(
        @NotBlank(message = "El título es obligatorio.")
        @Size(max = 60, message = "El título no puede superar los 60 caracteres.")
        String title,
        @NotBlank(message = "La descripción es obligatoria.")
        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres.")
        String description,
        @NotBlank(message = "La URL de la imagen es obligatoria.")
        @Size(max = 2048, message = "La URL de la imagen no puede superar los 2048 caracteres.")
        @HttpUrl(message = "La URL de la imagen debe ser una dirección HTTP o HTTPS válida.")
        String imageUrl) { }
