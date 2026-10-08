package com.horizonte.product;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Set;

public record ProductRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 1200) String description,
        @NotNull Long categoryId,
        @NotBlank @Size(max = 100) String city,
        @NotNull @DecimalMin(value = "0.01") BigDecimal price,
        Set<Long> characteristicIds) { }
