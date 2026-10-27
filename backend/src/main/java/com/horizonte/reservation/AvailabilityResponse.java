package com.horizonte.reservation;

import java.util.List;

public record AvailabilityResponse(Long productId, List<OccupiedRangeResponse> occupiedRanges) { }
