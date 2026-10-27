package com.horizonte.review;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        int rating,
        String comment,
        String userName,
        LocalDateTime createdAt) {

    public static ReviewResponse from(Review review) {
        String name = (review.getUser().getFirstName() + " " + review.getUser().getLastName()).trim();
        return new ReviewResponse(review.getId(), review.getRating(), review.getComment(), name, review.getCreatedAt());
    }
}
