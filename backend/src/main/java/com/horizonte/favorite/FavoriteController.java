package com.horizonte.favorite;

import com.horizonte.product.ProductResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    private final FavoriteService service;

    public FavoriteController(FavoriteService service) {
        this.service = service;
    }

    @GetMapping
    public List<ProductResponse> list(Authentication authentication) {
        return service.list(authentication.getName());
    }

    @PutMapping("/{productId}")
    public ProductResponse add(@PathVariable Long productId, Authentication authentication) {
        return service.add(productId, authentication.getName());
    }

    @DeleteMapping("/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Long productId, Authentication authentication) {
        service.remove(productId, authentication.getName());
    }
}
