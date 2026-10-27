package com.horizonte.reservation;

import com.horizonte.product.Product;
import com.horizonte.product.ProductNotFoundException;
import com.horizonte.product.ProductRepository;
import com.horizonte.user.AppUser;
import com.horizonte.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationService {
    private final ReservationRepository repository;
    private final ProductRepository products;
    private final UserService users;
    private final Clock clock;

    public ReservationService(ReservationRepository repository, ProductRepository products, UserService users, Clock clock) {
        this.repository = repository;
        this.products = products;
        this.users = users;
        this.clock = clock;
    }

    @Transactional
    public ReservationResponse create(ReservationRequest request, String email) {
        validateDates(request.checkIn(), request.checkOut(), true);
        Product product = products.findByIdForUpdate(request.productId())
                .orElseThrow(() -> new ProductNotFoundException(request.productId()));
        if (repository.existsOverlap(product.getId(), request.checkIn(), request.checkOut())) {
            throw new ReservationConflictException();
        }
        AppUser user = users.getByEmail(email);
        Reservation reservation = new Reservation();
        reservation.setProduct(product);
        reservation.setUser(user);
        reservation.setCheckIn(request.checkIn());
        reservation.setCheckOut(request.checkOut());
        return ReservationResponse.from(repository.save(reservation), today());
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> listMine(String email) {
        AppUser user = users.getByEmail(email);
        LocalDate today = today();
        return repository.findAllByUserIdOrderByCheckInDesc(user.getId()).stream()
                .map(reservation -> ReservationResponse.from(reservation, today))
                .toList();
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse availability(Long productId) {
        if (!products.existsById(productId)) throw new ProductNotFoundException(productId);
        List<OccupiedRangeResponse> ranges = repository.findFutureByProductId(productId, today()).stream()
                .map(value -> new OccupiedRangeResponse(value.getCheckIn(), value.getCheckOut()))
                .toList();
        return new AvailabilityResponse(productId, ranges);
    }

    @Transactional(readOnly = true)
    public boolean hasCompletedReservation(Long userId, Long productId) {
        return repository.existsByUserIdAndProductIdAndCheckOutLessThanEqual(userId, productId, today());
    }

    public void validateSearchDates(LocalDate checkIn, LocalDate checkOut) {
        if ((checkIn == null) != (checkOut == null)) {
            throw new IllegalArgumentException("Debés indicar tanto la fecha de ingreso como la fecha de salida.");
        }
        if (checkIn != null) validateDates(checkIn, checkOut, true);
    }

    private void validateDates(LocalDate checkIn, LocalDate checkOut, boolean rejectPast) {
        if (checkIn == null || checkOut == null) return;
        if (rejectPast && checkIn.isBefore(today())) {
            throw new IllegalArgumentException("La fecha de ingreso no puede estar en el pasado.");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("La fecha de salida debe ser posterior a la fecha de ingreso.");
        }
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }
}
