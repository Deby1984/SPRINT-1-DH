package com.horizonte.user;
import jakarta.validation.constraints.NotNull;
public record RoleRequest(@NotNull Role role) { }
