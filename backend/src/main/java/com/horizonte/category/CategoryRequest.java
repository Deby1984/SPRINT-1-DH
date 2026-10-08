package com.horizonte.category;

import jakarta.validation.constraints.*;

public record CategoryRequest(
        @NotBlank @Size(max = 60) String title,
        @NotBlank @Size(max = 500) String description,
        @NotBlank @Size(max = 2048) String imageUrl) { }
