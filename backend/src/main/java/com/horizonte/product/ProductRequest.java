package com.horizonte.product;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Set;

public record ProductRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 120, message = "El nombre no puede superar los 120 caracteres.")
        String name,
        @NotBlank(message = "La descripción es obligatoria.")
        @Size(max = 1200, message = "La descripción no puede superar los 1200 caracteres.")
        String description,
        @NotNull(message = "La categoría es obligatoria.") Long categoryId,
        @NotBlank(message = "La ciudad es obligatoria.")
        @Size(max = 100, message = "La ciudad no puede superar los 100 caracteres.")
        String city,
        @NotNull(message = "El precio es obligatorio.")
        @DecimalMin(value = "0.01", message = "El precio debe ser de al menos 0,01.")
        BigDecimal price,
        @NotEmpty(message = "Seleccioná al menos una característica.")
        Set<@NotNull(message = "La característica seleccionada no es válida.") Long> characteristicIds,
        @NotBlank(message = "Las normas de la casa son obligatorias.")
        @Size(max = 1200, message = "Las normas de la casa no pueden superar los 1200 caracteres.")
        String houseRules,
        @NotBlank(message = "La información de salud y seguridad es obligatoria.")
        @Size(max = 1200, message = "La información de salud y seguridad no puede superar los 1200 caracteres.")
        String healthAndSafety,
        @NotBlank(message = "La política de cancelación es obligatoria.")
        @Size(max = 1200, message = "La política de cancelación no puede superar los 1200 caracteres.")
        String cancellationPolicy) { }
