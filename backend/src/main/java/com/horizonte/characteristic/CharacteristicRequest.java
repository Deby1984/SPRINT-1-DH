package com.horizonte.characteristic;
import jakarta.validation.constraints.*;
public record CharacteristicRequest(@NotBlank @Size(max=60) String name, @NotBlank @Size(max=24) String icon) { }
