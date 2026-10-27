package com.horizonte.reservation;

public class ReservationConflictException extends RuntimeException {
    public ReservationConflictException() {
        super("El alojamiento ya está reservado para alguna de las fechas seleccionadas.");
    }
}
