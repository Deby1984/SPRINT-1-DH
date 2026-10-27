package com.horizonte.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
        @NotNull(message = "El producto es obligatorio.") Long productId,
        @Min(value = 1, message = "La puntuación mínima es 1.")
        @Max(value = 5, message = "La puntuación máxima es 5.")
        int rating,
        @Size(max = 1000, message = "El comentario no puede superar los 1000 caracteres.")
        String comment) { }
