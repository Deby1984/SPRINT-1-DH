package com.horizonte.reservation;

import java.time.LocalDate;

public record OccupiedRangeResponse(LocalDate checkIn, LocalDate checkOut) { }
