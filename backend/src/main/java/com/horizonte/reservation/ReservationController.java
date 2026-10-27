package com.horizonte.reservation;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReservationController {
    private final ReservationService service;

    public ReservationController(ReservationService service) {
        this.service = service;
    }

    @GetMapping("/api/products/{productId}/availability")
    public AvailabilityResponse availability(@PathVariable Long productId) {
        return service.availability(productId);
    }

    @PostMapping("/api/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationResponse create(@Valid @RequestBody ReservationRequest request, Authentication authentication) {
        return service.create(request, authentication.getName());
    }

    @GetMapping("/api/reservations/me")
    public List<ReservationResponse> mine(Authentication authentication) {
        return service.listMine(authentication.getName());
    }
}
