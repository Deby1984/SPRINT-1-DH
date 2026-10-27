package com.horizonte.favorite;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    @EntityGraph(attributePaths = {"product", "product.categoryEntity", "product.characteristics", "product.images"})
    List<Favorite> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    @Modifying
    void deleteAllByProductId(Long productId);
}
