package com.horizonte.favorite;

import com.horizonte.product.Product;
import com.horizonte.product.ProductNotFoundException;
import com.horizonte.product.ProductRepository;
import com.horizonte.product.ProductResponse;
import com.horizonte.user.AppUser;
import com.horizonte.user.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {
    private final FavoriteRepository repository;
    private final ProductRepository products;
    private final UserService users;

    public FavoriteService(FavoriteRepository repository, ProductRepository products, UserService users) {
        this.repository = repository;
        this.products = products;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> list(String email) {
        AppUser user = users.getByEmail(email);
        return repository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(Favorite::getProduct)
                .map(ProductResponse::from)
                .toList();
    }

    @Transactional
    public ProductResponse add(Long productId, String email) {
        AppUser user = users.getByEmail(email);
        Product product = products.findById(productId).orElseThrow(() -> new ProductNotFoundException(productId));
        if (!repository.existsByUserIdAndProductId(user.getId(), productId)) {
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setProduct(product);
            try {
                repository.saveAndFlush(favorite);
            } catch (DataIntegrityViolationException exception) {
                if (!repository.existsByUserIdAndProductId(user.getId(), productId)) throw exception;
            }
        }
        return ProductResponse.from(product);
    }

    @Transactional
    public void remove(Long productId, String email) {
        AppUser user = users.getByEmail(email);
        repository.findByUserIdAndProductId(user.getId(), productId).ifPresent(repository::delete);
    }
}
