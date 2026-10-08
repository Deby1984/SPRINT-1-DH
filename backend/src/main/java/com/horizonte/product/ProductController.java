package com.horizonte.product;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }
    @GetMapping public PageResponse<ProductResponse> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return PageResponse.from(service.list(page, size), ProductResponse::from);
    }
    @GetMapping("/random") public List<ProductResponse> random(@RequestParam(defaultValue = "10") int limit) {
        return service.random(limit).stream().map(ProductResponse::from).toList();
    }
    @GetMapping("/{id}") public ProductResponse get(@PathVariable Long id) { return ProductResponse.from(service.get(id)); }
    @PostMapping(consumes = "multipart/form-data") @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @ModelAttribute ProductRequest request, @RequestParam("images") MultipartFile[] images) {
        return ProductResponse.from(service.create(request, images));
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { service.delete(id); }
}
