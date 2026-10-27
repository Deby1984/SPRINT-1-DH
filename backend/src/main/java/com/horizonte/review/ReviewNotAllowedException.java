package com.horizonte.review;

public class ReviewNotAllowedException extends RuntimeException {
    public ReviewNotAllowedException() {
        super("Solo podés valorar un alojamiento después de finalizar una reserva.");
    }
}
