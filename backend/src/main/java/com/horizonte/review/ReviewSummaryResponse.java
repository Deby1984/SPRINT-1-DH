package com.horizonte.review;

import java.math.BigDecimal;
import java.util.List;

public record ReviewSummaryResponse(
        List<ReviewResponse> reviews,
        BigDecimal averageRating,
        long reviewCount) { }
