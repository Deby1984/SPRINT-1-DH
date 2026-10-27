package com.horizonte.review;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    @EntityGraph(attributePaths = {"user"})
    List<Review> findAllByProductIdOrderByCreatedAtDesc(Long productId);
    boolean existsByUserIdAndProductId(Long userId, Long productId);
    @Modifying
    void deleteAllByProductId(Long productId);
}
