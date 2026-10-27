package com.horizonte.review;

public class DuplicateReviewException extends RuntimeException {
    public DuplicateReviewException() {
        super("Ya publicaste una valoración para este alojamiento.");
    }
}
