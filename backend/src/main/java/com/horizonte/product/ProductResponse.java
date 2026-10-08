package com.horizonte.product;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String description,
        String category,
        String city,
        BigDecimal price,
        List<String> images) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getCity(),
                product.getPrice(),
                List.copyOf(product.getImages()));
    }
}
