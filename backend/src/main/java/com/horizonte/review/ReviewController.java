package com.horizonte.review;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
public class ReviewController {
    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping("/api/products/{productId}/reviews")
    public ReviewSummaryResponse list(@PathVariable Long productId) {
        return service.list(productId);
    }

    @GetMapping("/api/reviews/eligibility")
    public ReviewEligibilityResponse eligibility(@RequestParam Long productId, Authentication authentication) {
        return service.eligibility(productId, authentication.getName());
    }

    @PostMapping("/api/reviews")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@Valid @RequestBody ReviewRequest request, Authentication authentication) {
        return service.create(request, authentication.getName());
    }
}
