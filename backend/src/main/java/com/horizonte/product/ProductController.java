package com.horizonte.product;

import com.horizonte.user.SessionUser;
import com.horizonte.user.UserRepository;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    private final UserRepository users;
    public ProductController(ProductService service, UserRepository users) { this.service = service; this.users = users; }
    @GetMapping public PageResponse<ProductResponse> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return PageResponse.from(service.list(page, size), ProductResponse::from);
    }
    @GetMapping("/random") public List<ProductResponse> random(@RequestParam(defaultValue = "10") int limit) {
        return service.random(limit).stream().map(ProductResponse::from).toList();
    }
    @GetMapping("/filter") public ProductFilterResponse filter(@RequestParam(required = false) List<Long> categoryIds) {
        List<ProductResponse> products = service.filter(categoryIds).stream().map(ProductResponse::from).toList();
        return new ProductFilterResponse(products, products.size(), service.list(0, 1).getTotalElements());
    }
    @GetMapping("/{id}") public ProductResponse get(@PathVariable Long id) { return ProductResponse.from(service.get(id)); }
    @PostMapping(consumes = "multipart/form-data") @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @ModelAttribute ProductRequest request, @RequestParam("images") MultipartFile[] images, HttpSession session) {
        SessionUser.requireAdmin(session, users);
        return ProductResponse.from(service.create(request, images));
    }
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ProductResponse update(@PathVariable Long id, @Valid @ModelAttribute ProductRequest request, @RequestParam(value = "images", required = false) MultipartFile[] images, HttpSession session) {
        SessionUser.requireAdmin(session, users); return ProductResponse.from(service.update(id, request, images));
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id, HttpSession session) { SessionUser.requireAdmin(session, users); service.delete(id); }
}
