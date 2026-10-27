package com.horizonte.reservation;

import java.time.LocalDate;

public record ReservationResponse(
        Long id,
        Long productId,
        String productName,
        LocalDate checkIn,
        LocalDate checkOut,
        ReservationStatus status) {

    public static ReservationResponse from(Reservation reservation, LocalDate today) {
        ReservationStatus status;
        if (!reservation.getCheckOut().isAfter(today)) status = ReservationStatus.COMPLETED;
        else if (reservation.getCheckIn().isAfter(today)) status = ReservationStatus.UPCOMING;
        else status = ReservationStatus.ACTIVE;
        return new ReservationResponse(
                reservation.getId(),
                reservation.getProduct().getId(),
                reservation.getProduct().getName(),
                reservation.getCheckIn(),
                reservation.getCheckOut(),
                status);
    }
}
