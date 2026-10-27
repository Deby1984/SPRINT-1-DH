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
        List<CharacteristicResponse> characteristics,
        List<ProductPolicyResponse> policies,
        BigDecimal averageRating,
        long reviewCount) {

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
                product.getCharacteristics().stream().map(CharacteristicResponse::from).toList(),
                List.of(
                        new ProductPolicyResponse("Normas de la casa", product.getHouseRules()),
                        new ProductPolicyResponse("Salud y seguridad", product.getHealthAndSafety()),
                        new ProductPolicyResponse("Política de cancelación", product.getCancellationPolicy())),
                product.getAverageRating(),
                product.getReviewCount());
    }
}
