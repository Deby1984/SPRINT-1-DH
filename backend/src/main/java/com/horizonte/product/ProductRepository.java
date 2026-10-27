package com.horizonte.product;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Collection;
import java.util.Optional;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Product> findDistinctByCategoryEntityIdInOrderByIdDesc(List<Long> categoryIds);
    boolean existsByCategoryEntityId(Long categoryId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            select distinct p.city from Product p
            where lower(p.city) like lower(concat('%', :query, '%'))
            order by p.city
            """)
    List<String> findCitySuggestions(@Param("query") String query, Pageable pageable);

    @Query("""
            select distinct p from Product p
            where (:city = '' or lower(p.city) like lower(concat('%', :city, '%')))
              and (:filterCategories = false or p.categoryEntity.id in :categoryIds)
              and (:checkIn is null or not exists (
                    select r.id from Reservation r
                    where r.product = p
                      and r.checkIn < :checkOut
                      and r.checkOut > :checkIn
              ))
            order by p.id desc
            """)
    List<Product> search(
            @Param("city") String city,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("filterCategories") boolean filterCategories,
            @Param("categoryIds") Collection<Long> categoryIds);
}
