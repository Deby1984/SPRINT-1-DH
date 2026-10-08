package com.horizonte.characteristic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface CharacteristicRepository extends JpaRepository<Characteristic, Long> {
    Optional<Characteristic> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
