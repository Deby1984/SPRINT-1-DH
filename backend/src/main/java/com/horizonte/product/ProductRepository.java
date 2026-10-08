package com.horizonte.product;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Product> findDistinctByCategoryEntityIdInOrderByIdDesc(List<Long> categoryIds);
}
