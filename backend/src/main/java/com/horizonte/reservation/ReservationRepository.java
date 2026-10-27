package com.horizonte.reservation;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    @Query("""
            select case when count(r) > 0 then true else false end from Reservation r
            where r.product.id = :productId
              and r.checkIn < :checkOut
              and r.checkOut > :checkIn
            """)
    boolean existsOverlap(
            @Param("productId") Long productId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut);

    @Query("""
            select r from Reservation r
            where r.product.id = :productId and r.checkOut > :today
            order by r.checkIn
            """)
    List<Reservation> findFutureByProductId(
            @Param("productId") Long productId,
            @Param("today") LocalDate today);

    @EntityGraph(attributePaths = {"product"})
    List<Reservation> findAllByUserIdOrderByCheckInDesc(Long userId);

    boolean existsByUserIdAndProductIdAndCheckOutLessThanEqual(
            Long userId, Long productId, LocalDate date);

    boolean existsByProductId(Long productId);

    @Modifying
    void deleteAllByProductId(Long productId);
}
