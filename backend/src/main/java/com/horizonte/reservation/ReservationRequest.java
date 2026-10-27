package com.horizonte.reservation;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ReservationRequest(
        @NotNull(message = "El producto es obligatorio.") Long productId,
        @NotNull(message = "La fecha de ingreso es obligatoria.") LocalDate checkIn,
        @NotNull(message = "La fecha de salida es obligatoria.") LocalDate checkOut) { }
