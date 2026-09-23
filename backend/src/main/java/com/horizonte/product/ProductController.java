package com.horizonte.product;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }
    @GetMapping public Page<Product> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) { return service.list(page, size); }
    @GetMapping("/random") public List<Product> random(@RequestParam(defaultValue = "10") int limit) { return service.random(limit); }
    @GetMapping("/{id}") public Product get(@PathVariable Long id) { return service.get(id); }
    @PostMapping(consumes = "multipart/form-data") @ResponseStatus(HttpStatus.CREATED)
    public Product create(@Valid @ModelAttribute ProductRequest request, @RequestParam("images") MultipartFile[] images) { return service.create(request, images); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id) { service.delete(id); }
}
