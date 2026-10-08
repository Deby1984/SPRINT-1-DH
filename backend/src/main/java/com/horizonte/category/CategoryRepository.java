package com.horizonte.category;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCase(String title);
}
