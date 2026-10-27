package com.horizonte.review;

import com.horizonte.product.Product;
import com.horizonte.product.ProductNotFoundException;
import com.horizonte.product.ProductRepository;
import com.horizonte.reservation.ReservationService;
import com.horizonte.user.AppUser;
import com.horizonte.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository repository;
    private final ProductRepository products;
    private final UserService users;
    private final ReservationService reservations;

    public ReviewService(ReviewRepository repository, ProductRepository products, UserService users, ReservationService reservations) {
        this.repository = repository;
        this.products = products;
        this.users = users;
        this.reservations = reservations;
    }

    @Transactional(readOnly = true)
    public ReviewSummaryResponse list(Long productId) {
        if (!products.existsById(productId)) throw new ProductNotFoundException(productId);
        List<Review> reviews = repository.findAllByProductIdOrderByCreatedAtDesc(productId);
        return summary(reviews);
    }

    @Transactional(readOnly = true)
    public ReviewEligibilityResponse eligibility(Long productId, String email) {
        if (!products.existsById(productId)) throw new ProductNotFoundException(productId);
        AppUser user = users.getByEmail(email);
        if (repository.existsByUserIdAndProductId(user.getId(), productId)) {
            return new ReviewEligibilityResponse(false, "Ya publicaste una valoración para este alojamiento.");
        }
        boolean eligible = reservations.hasCompletedReservation(user.getId(), productId);
        return new ReviewEligibilityResponse(
                eligible,
                eligible ? "Podés compartir tu experiencia." : "Podrás valorar el alojamiento después de finalizar una reserva.");
    }

    @Transactional
    public ReviewResponse create(ReviewRequest request, String email) {
        Product product = products.findByIdForUpdate(request.productId())
                .orElseThrow(() -> new ProductNotFoundException(request.productId()));
        AppUser user = users.getByEmail(email);
        if (repository.existsByUserIdAndProductId(user.getId(), product.getId())) throw new DuplicateReviewException();
        if (!reservations.hasCompletedReservation(user.getId(), product.getId())) throw new ReviewNotAllowedException();

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(request.rating());
        review.setComment(normalizeComment(request.comment()));
        Review saved = repository.saveAndFlush(review);
        recalculate(product);
        return ReviewResponse.from(saved);
    }

    private void recalculate(Product product) {
        List<Review> reviews = repository.findAllByProductIdOrderByCreatedAtDesc(product.getId());
        BigDecimal average = average(reviews);
        product.setAverageRating(average);
        product.setReviewCount(reviews.size());
    }

    private ReviewSummaryResponse summary(List<Review> reviews) {
        return new ReviewSummaryResponse(
                reviews.stream().map(ReviewResponse::from).toList(),
                average(reviews),
                reviews.size());
    }

    private BigDecimal average(List<Review> reviews) {
        if (reviews.isEmpty()) return BigDecimal.ZERO.setScale(1);
        double value = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP);
    }

    private String normalizeComment(String comment) {
        if (comment == null || comment.isBlank()) return null;
        return comment.trim();
    }
}
