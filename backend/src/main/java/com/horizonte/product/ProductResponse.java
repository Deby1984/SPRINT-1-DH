package com.horizonte.product;

import com.horizonte.characteristic.CharacteristicResponse;
import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String description,
        Long categoryId,
        String category,
        String city,
        BigDecimal price,
        List<String> images,
        List<CharacteristicResponse> characteristics) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getCategoryEntity() == null ? null : product.getCategoryEntity().getId(),
                product.getCategory(),
                product.getCity(),
                product.getPrice(),
                List.copyOf(product.getImages()),
                product.getCharacteristics().stream().map(CharacteristicResponse::from).toList());
    }
}
